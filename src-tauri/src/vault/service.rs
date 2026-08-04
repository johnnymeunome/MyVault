use std::{
    collections::HashMap,
    fs::File,
    io::{Read, Take},
    path::Path,
    sync::Mutex,
};

use keepass::{
    config::DatabaseVersion,
    db::{DatabaseOpenError, GroupRef},
    Database, DatabaseKey,
};
use uuid::Uuid;
use zeroize::Zeroizing;

use super::{
    error::VaultError,
    model::{
        OpenKdbxRequest, OpenKdbxResult, VaultCapabilities, VaultDatabaseSummary,
        VaultEntrySummary, VaultGroupSummary,
    },
};

const MAX_DATABASE_BYTES: u64 = 64 * 1024 * 1024;
const MAX_KEY_FILE_BYTES: u64 = 1024 * 1024;
const MAX_KDF_MEMORY_BYTES: u64 = 512 * 1024 * 1024;
const MAX_ARGON2_ITERATIONS: u64 = 100;
const MAX_AES_KDF_ROUNDS: u64 = 10_000_000;
const MAX_HEADER_FIELD_BYTES: usize = 1024 * 1024;
const MAX_GROUP_DEPTH: usize = 64;
const MAX_GROUPS: usize = 10_000;
const MAX_ENTRIES: usize = 10_000;

struct VaultSession {
    _database: Database,
}

#[derive(Default)]
pub struct VaultState {
    sessions: Mutex<HashMap<String, VaultSession>>,
}

impl VaultState {
    pub fn open_read_only(&self, request: OpenKdbxRequest) -> Result<OpenKdbxResult, VaultError> {
        let password = Zeroizing::new(request.password);
        let data = read_file_bounded(Path::new(&request.path), MAX_DATABASE_BYTES)?;
        let version = DatabaseVersion::parse(&data).map_err(DatabaseOpenError::from)?;

        validate_version(&version)?;
        enforce_kdf_limits(&data, &version)?;

        let mut key = DatabaseKey::new().with_password(password.as_str());
        if let Some(key_file_path) = request.key_file_path.filter(|value| !value.is_empty()) {
            let key_data = read_key_file_bounded(Path::new(&key_file_path))?;
            key = key
                .with_keyfile(&mut key_data.as_slice())
                .map_err(|_| VaultError::FileUnreadable)?;
        }

        let database = Database::parse(&data, key).map_err(VaultError::from)?;
        let summary = project_database(&database)?;
        let session_id = Uuid::new_v4().to_string();

        let mut sessions = self.sessions.lock().map_err(|_| VaultError::Internal)?;
        sessions.clear();
        sessions.insert(
            session_id.clone(),
            VaultSession {
                _database: database,
            },
        );

        Ok(OpenKdbxResult {
            session_id,
            database: summary,
            capabilities: VaultCapabilities::read_only(),
        })
    }

    pub fn close(&self, session_id: &str) -> Result<(), VaultError> {
        let mut sessions = self.sessions.lock().map_err(|_| VaultError::Internal)?;
        sessions.remove(session_id);
        Ok(())
    }

    pub fn clear(&self) -> Result<(), VaultError> {
        let mut sessions = self.sessions.lock().map_err(|_| VaultError::Internal)?;
        sessions.clear();
        Ok(())
    }
}

fn read_file_bounded(path: &Path, max_bytes: u64) -> Result<Vec<u8>, VaultError> {
    let file = File::open(path).map_err(map_file_error)?;
    let metadata = file.metadata().map_err(|_| VaultError::FileUnreadable)?;

    if !metadata.is_file() {
        return Err(VaultError::FileUnreadable);
    }
    if metadata.len() > max_bytes {
        return Err(VaultError::ResourceLimitExceeded);
    }

    let mut data = Vec::with_capacity(metadata.len() as usize);
    let mut reader: Take<File> = file.take(max_bytes + 1);
    reader
        .read_to_end(&mut data)
        .map_err(|_| VaultError::FileUnreadable)?;

    if data.len() as u64 > max_bytes {
        return Err(VaultError::ResourceLimitExceeded);
    }

    Ok(data)
}

fn read_key_file_bounded(path: &Path) -> Result<Zeroizing<Vec<u8>>, VaultError> {
    let file = File::open(path).map_err(map_file_error)?;
    let metadata = file.metadata().map_err(|_| VaultError::FileUnreadable)?;

    if !metadata.is_file() {
        return Err(VaultError::FileUnreadable);
    }
    if metadata.len() > MAX_KEY_FILE_BYTES {
        return Err(VaultError::ResourceLimitExceeded);
    }

    let mut data = Zeroizing::new(Vec::with_capacity(metadata.len() as usize));
    let mut reader: Take<File> = file.take(MAX_KEY_FILE_BYTES + 1);
    reader
        .read_to_end(&mut data)
        .map_err(|_| VaultError::FileUnreadable)?;

    if data.len() as u64 > MAX_KEY_FILE_BYTES {
        return Err(VaultError::ResourceLimitExceeded);
    }

    Ok(data)
}

fn map_file_error(error: std::io::Error) -> VaultError {
    if error.kind() == std::io::ErrorKind::NotFound {
        VaultError::FileNotFound
    } else {
        VaultError::FileUnreadable
    }
}

fn project_database(database: &Database) -> Result<VaultDatabaseSummary, VaultError> {
    let mut groups = Vec::new();
    let mut entries = Vec::new();
    project_group(database.root(), None, 0, &mut groups, &mut entries)?;

    let name = database
        .meta
        .database_name
        .clone()
        .filter(|value| !value.trim().is_empty())
        .unwrap_or_else(|| database.root().name.clone());

    Ok(VaultDatabaseSummary {
        name,
        format: format_version(&database.config.version)?,
        groups,
        entries,
    })
}

fn project_group(
    group: GroupRef<'_>,
    parent_id: Option<String>,
    depth: usize,
    groups: &mut Vec<VaultGroupSummary>,
    entries: &mut Vec<VaultEntrySummary>,
) -> Result<(), VaultError> {
    ensure_group_capacity(depth, groups.len())?;

    let group_id = group.id().to_string();
    groups.push(VaultGroupSummary {
        id: group_id.clone(),
        parent_id,
        name: group.name.clone(),
        depth,
    });

    for entry in group.entries() {
        ensure_entry_capacity(entries.len())?;

        entries.push(VaultEntrySummary {
            id: entry.id().to_string(),
            group_id: group_id.clone(),
            title: entry.get_title().unwrap_or("Sem título").to_string(),
            username: entry.get_username().unwrap_or_default().to_string(),
            url: entry.get_url().unwrap_or_default().to_string(),
            favorite: false,
            updated_at: entry
                .times
                .last_modification
                .map(|value| format!("{}Z", value.format("%Y-%m-%dT%H:%M:%S"))),
        });
    }

    for child in group.groups() {
        project_group(child, Some(group_id.clone()), depth + 1, groups, entries)?;
    }

    Ok(())
}

fn ensure_group_capacity(depth: usize, group_count: usize) -> Result<(), VaultError> {
    if depth > MAX_GROUP_DEPTH || group_count >= MAX_GROUPS {
        Err(VaultError::ResourceLimitExceeded)
    } else {
        Ok(())
    }
}

fn ensure_entry_capacity(entry_count: usize) -> Result<(), VaultError> {
    if entry_count >= MAX_ENTRIES {
        Err(VaultError::ResourceLimitExceeded)
    } else {
        Ok(())
    }
}

fn format_version(version: &DatabaseVersion) -> Result<String, VaultError> {
    match version {
        DatabaseVersion::KDB3(1) => Ok("KDBX 3.1".to_string()),
        DatabaseVersion::KDB4(minor) if *minor <= 1 => Ok(format!("KDBX 4.{minor}")),
        DatabaseVersion::KDB3(_) | DatabaseVersion::KDB4(_) => Err(VaultError::UnsupportedVersion),
        _ => Err(VaultError::UnsupportedVersion),
    }
}

fn validate_version(version: &DatabaseVersion) -> Result<(), VaultError> {
    match version {
        DatabaseVersion::KDB3(1) | DatabaseVersion::KDB4(0 | 1) => Ok(()),
        _ => Err(VaultError::UnsupportedVersion),
    }
}

fn enforce_kdf_limits(data: &[u8], version: &DatabaseVersion) -> Result<(), VaultError> {
    match version {
        DatabaseVersion::KDB3(_) => inspect_kdbx3_header(data),
        DatabaseVersion::KDB4(_) => inspect_kdbx4_header(data),
        _ => Err(VaultError::UnsupportedVersion),
    }
}

fn inspect_kdbx3_header(data: &[u8]) -> Result<(), VaultError> {
    let mut offset = 12usize;

    loop {
        let field_type = *data.get(offset).ok_or(VaultError::FormatInvalid)?;
        let length = read_u16(data, offset + 1)? as usize;
        offset = offset.checked_add(3).ok_or(VaultError::FormatInvalid)?;
        if length > MAX_HEADER_FIELD_BYTES {
            return Err(VaultError::ResourceLimitExceeded);
        }
        let field = take_slice(data, offset, length)?;
        offset = offset
            .checked_add(length)
            .ok_or(VaultError::FormatInvalid)?;
        if field_type == 6 && (field.len() != 8 || read_u64_from_slice(field)? > MAX_AES_KDF_ROUNDS)
        {
            return Err(VaultError::ResourceLimitExceeded);
        }
        if field_type == 0 {
            return Ok(());
        }
    }
}

fn inspect_kdbx4_header(data: &[u8]) -> Result<(), VaultError> {
    let mut offset = 12usize;

    loop {
        let field_type = *data.get(offset).ok_or(VaultError::FormatInvalid)?;
        let length = read_u32(data, offset + 1)? as usize;
        offset = offset.checked_add(5).ok_or(VaultError::FormatInvalid)?;
        if length > MAX_HEADER_FIELD_BYTES {
            return Err(VaultError::ResourceLimitExceeded);
        }
        let field = take_slice(data, offset, length)?;
        offset = offset
            .checked_add(length)
            .ok_or(VaultError::FormatInvalid)?;
        if field_type == 11 {
            inspect_variant_dictionary(field)?;
        }
        if field_type == 0 {
            return Ok(());
        }
    }
}

fn inspect_variant_dictionary(data: &[u8]) -> Result<(), VaultError> {
    if data.len() < 2 {
        return Err(VaultError::FormatInvalid);
    }

    let mut offset = 2usize;
    loop {
        let value_type = *data.get(offset).ok_or(VaultError::FormatInvalid)?;
        offset = offset.checked_add(1).ok_or(VaultError::FormatInvalid)?;
        if value_type == 0 {
            return Ok(());
        }

        let key_length = read_u32(data, offset)? as usize;
        offset = offset.checked_add(4).ok_or(VaultError::FormatInvalid)?;
        let key = take_slice(data, offset, key_length)?;
        offset = offset
            .checked_add(key_length)
            .ok_or(VaultError::FormatInvalid)?;

        let value_length = read_u32(data, offset)? as usize;
        offset = offset.checked_add(4).ok_or(VaultError::FormatInvalid)?;
        let value = take_slice(data, offset, value_length)?;
        offset = offset
            .checked_add(value_length)
            .ok_or(VaultError::FormatInvalid)?;

        if value_type == 0x05 && value.len() == 8 {
            let number = read_u64_from_slice(value)?;
            match key {
                b"M" if number > MAX_KDF_MEMORY_BYTES => {
                    return Err(VaultError::ResourceLimitExceeded)
                }
                b"I" if number > MAX_ARGON2_ITERATIONS => {
                    return Err(VaultError::ResourceLimitExceeded)
                }
                b"R" if number > MAX_AES_KDF_ROUNDS => {
                    return Err(VaultError::ResourceLimitExceeded)
                }
                _ => {}
            }
        }
    }
}

fn read_u16(data: &[u8], offset: usize) -> Result<u16, VaultError> {
    let bytes: [u8; 2] = take_slice(data, offset, 2)?
        .try_into()
        .map_err(|_| VaultError::FormatInvalid)?;
    Ok(u16::from_le_bytes(bytes))
}

fn read_u32(data: &[u8], offset: usize) -> Result<u32, VaultError> {
    let bytes: [u8; 4] = take_slice(data, offset, 4)?
        .try_into()
        .map_err(|_| VaultError::FormatInvalid)?;
    Ok(u32::from_le_bytes(bytes))
}

fn read_u64_from_slice(data: &[u8]) -> Result<u64, VaultError> {
    let bytes: [u8; 8] = data.try_into().map_err(|_| VaultError::FormatInvalid)?;
    Ok(u64::from_le_bytes(bytes))
}

fn take_slice(data: &[u8], offset: usize, length: usize) -> Result<&[u8], VaultError> {
    let end = offset
        .checked_add(length)
        .ok_or(VaultError::FormatInvalid)?;
    data.get(offset..end).ok_or(VaultError::FormatInvalid)
}

#[cfg(test)]
mod tests {
    use std::{
        fs,
        path::{Path, PathBuf},
    };

    use keepass::{db::fields, Database};
    use sha2::{Digest, Sha256};

    use super::{
        ensure_entry_capacity, ensure_group_capacity, inspect_variant_dictionary, project_database,
        read_file_bounded, read_key_file_bounded, OpenKdbxRequest, VaultError, VaultState,
        MAX_ENTRIES, MAX_GROUPS, MAX_GROUP_DEPTH, MAX_KDF_MEMORY_BYTES,
    };

    #[test]
    fn projection_never_contains_passwords_or_notes() {
        let mut database = Database::new();
        database.meta.database_name = Some("Fixture".into());
        database.root_mut().add_entry().edit(|entry| {
            entry.set_unprotected(fields::TITLE, "Example service");
            entry.set_unprotected(fields::USERNAME, "demo-user");
            entry.set_unprotected(fields::URL, "https://example.test");
            entry.set_protected(fields::PASSWORD, "must-not-cross-ipc");
            entry.set_protected(fields::NOTES, "private note");
        });

        let result = project_database(&database).expect("fixture projection should succeed");
        let serialized = serde_json::to_string(&result).expect("projection should serialize");

        assert!(serialized.contains("Example service"));
        assert!(!serialized.contains("must-not-cross-ipc"));
        assert!(!serialized.contains("private note"));
        assert!(!serialized.contains("password"));
    }

    #[test]
    fn oversized_argon_memory_is_rejected_before_parsing() {
        let mut dictionary = vec![0, 1, 0x05];
        dictionary.extend_from_slice(&1u32.to_le_bytes());
        dictionary.extend_from_slice(b"M");
        dictionary.extend_from_slice(&8u32.to_le_bytes());
        dictionary.extend_from_slice(&(MAX_KDF_MEMORY_BYTES + 1).to_le_bytes());
        dictionary.push(0);

        assert_eq!(
            inspect_variant_dictionary(&dictionary),
            Err(VaultError::ResourceLimitExceeded)
        );
    }

    #[test]
    fn file_and_projection_limits_reject_excess_before_projection() {
        let path = std::env::temp_dir().join(format!(
            "myvault-resource-limit-{}.bin",
            uuid::Uuid::new_v4()
        ));
        fs::write(&path, b"five!").expect("temporary fixture should be written");
        let result = read_file_bounded(&path, 4).expect_err("oversized file should fail");
        fs::remove_file(&path).expect("temporary fixture should be removed");

        assert_eq!(result, VaultError::ResourceLimitExceeded);
        assert_eq!(
            ensure_group_capacity(MAX_GROUP_DEPTH + 1, 0),
            Err(VaultError::ResourceLimitExceeded)
        );
        assert_eq!(
            ensure_group_capacity(0, MAX_GROUPS),
            Err(VaultError::ResourceLimitExceeded)
        );
        assert_eq!(
            ensure_entry_capacity(MAX_ENTRIES),
            Err(VaultError::ResourceLimitExceeded)
        );
    }

    #[test]
    fn compatibility_matrix_opens_without_modifying_sources() {
        let cases = [
            ("kdbx31-aes-aeskdf-password.kdbx", "KDBX 3.1"),
            ("kdbx40-aes-argon2d-password.kdbx", "KDBX 4.0"),
            ("kdbx40-aes-argon2id-password.kdbx", "KDBX 4.0"),
            ("kdbx40-chacha20-argon2id-password.kdbx", "KDBX 4.0"),
            ("kdbx41-aes-aeskdf-password.kdbx", "KDBX 4.1"),
        ];

        for (name, expected_format) in cases {
            let path = fixture_path(name);
            let before = sha256(&path);
            let state = VaultState::default();
            let result = state
                .open_read_only(request(&path, "demopass", None))
                .expect("fixture should open");

            assert_eq!(result.database.format, expected_format);
            assert!(!result.database.entries.is_empty());
            assert!(result.capabilities.read);
            assert!(!result.capabilities.write);
            assert!(!result.capabilities.reveal_secrets);
            state
                .close(&result.session_id)
                .expect("session should close");
            state
                .close(&result.session_id)
                .expect("closing twice should be safe");
            assert_eq!(before, sha256(&path));
        }
    }

    #[test]
    fn password_and_keyfile_fixture_opens() {
        let database = fixture_path("kdbx40-password-keyfile.kdbx");
        let keyfile = fixture_path("kdbx40-password-keyfile.keyx");
        let key_data = read_key_file_bounded(&keyfile).expect("keyfile should be read");
        let _: &zeroize::Zeroizing<Vec<u8>> = &key_data;
        assert!(!key_data.is_empty());

        let result = VaultState::default()
            .open_read_only(request(&database, "demopass", Some(&keyfile)))
            .expect("password and keyfile fixture should open");

        assert_eq!(result.database.format, "KDBX 4.0");
    }

    #[test]
    fn clear_discards_every_open_session() {
        let state = VaultState::default();
        let database = fixture_path("kdbx41-aes-aeskdf-password.kdbx");
        state
            .open_read_only(request(&database, "demopass", None))
            .expect("fixture should open");

        assert_eq!(state.sessions.lock().expect("sessions lock").len(), 1);
        state.clear().expect("sessions should clear");
        assert!(state.sessions.lock().expect("sessions lock").is_empty());
    }

    #[test]
    fn password_and_keyfile_fixture_rejects_missing_or_wrong_keyfile() {
        let state = VaultState::default();
        let database = fixture_path("kdbx40-password-keyfile.kdbx");

        assert_eq!(
            state
                .open_read_only(request(&database, "demopass", None))
                .expect_err("missing keyfile should fail"),
            VaultError::InvalidKey
        );
        assert_eq!(
            state
                .open_read_only(request(
                    &database,
                    "demopass",
                    Some(&fixture_path("random-data.kdbx")),
                ))
                .expect_err("wrong keyfile should fail"),
            VaultError::InvalidKey
        );
    }

    #[test]
    fn wrong_password_and_negative_fixtures_are_redacted() {
        let state = VaultState::default();
        let valid = fixture_path("kdbx41-aes-aeskdf-password.kdbx");
        assert_eq!(
            state
                .open_read_only(request(&valid, "wrong-password", None))
                .expect_err("wrong password should fail"),
            VaultError::InvalidKey
        );

        let cases = [
            ("corrupt-header.kdbx", VaultError::FormatInvalid),
            ("corrupt-hmac.kdbx", VaultError::IntegrityFailed),
            ("unsupported-version.kdbx", VaultError::UnsupportedVersion),
            ("random-data.kdbx", VaultError::FormatInvalid),
        ];

        for (name, expected) in cases {
            let error = state
                .open_read_only(request(&fixture_path(name), "demopass", None))
                .expect_err("negative fixture should fail");
            assert_eq!(error, expected, "unexpected error for {name}");
        }

        assert!(state
            .open_read_only(request(&fixture_path("truncated.kdbx"), "demopass", None,))
            .is_err());
    }

    fn request(path: &Path, password: &str, keyfile: Option<&Path>) -> OpenKdbxRequest {
        OpenKdbxRequest {
            path: path.to_string_lossy().into_owned(),
            password: password.to_string(),
            key_file_path: keyfile.map(|value| value.to_string_lossy().into_owned()),
        }
    }

    fn fixture_path(name: &str) -> PathBuf {
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("tests")
            .join("fixtures")
            .join("kdbx")
            .join(name)
    }

    fn sha256(path: &PathBuf) -> Vec<u8> {
        let data = fs::read(path).expect("fixture should be readable");
        Sha256::digest(data).to_vec()
    }
}
