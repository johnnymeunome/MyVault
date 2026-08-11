use std::{
    fs::{File, OpenOptions},
    io::{Read, Write},
    path::Path,
};

use keepass::{config::DatabaseVersion, db::DatabaseSaveError, Database, DatabaseKey};
use zeroize::Zeroizing;

const MAX_FIXTURE_BYTES: u64 = 64 * 1024 * 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum VerifiedCopyError {
    SourceUnreadable,
    UnsupportedWriteFormat,
    InvalidKey,
    DestinationExists,
    DestinationUnwritable,
    WriteFailed,
    SyncFailed,
    VerifyFailed,
}

fn round_trip_fixture_copy(
    source: &Path,
    destination: &Path,
    password: String,
) -> Result<(), VerifiedCopyError> {
    let password = Zeroizing::new(password);
    let source_bytes = read_fixture(source)?;
    let version =
        DatabaseVersion::parse(&source_bytes).map_err(|_| VerifiedCopyError::SourceUnreadable)?;

    if version != DatabaseVersion::KDB4(1) {
        return Err(VerifiedCopyError::UnsupportedWriteFormat);
    }

    let key = DatabaseKey::new().with_password(password.as_str());
    let database = Database::parse(&source_bytes, key.clone()).map_err(|error| match error {
        keepass::db::DatabaseOpenError::Key(_) => VerifiedCopyError::InvalidKey,
        _ => VerifiedCopyError::SourceUnreadable,
    })?;

    let mut destination_file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(destination)
        .map_err(|error| {
            if error.kind() == std::io::ErrorKind::AlreadyExists {
                VerifiedCopyError::DestinationExists
            } else {
                VerifiedCopyError::DestinationUnwritable
            }
        })?;

    database
        .save(&mut destination_file, key.clone())
        .map_err(map_save_error)?;
    destination_file
        .flush()
        .map_err(|_| VerifiedCopyError::WriteFailed)?;
    destination_file
        .sync_all()
        .map_err(|_| VerifiedCopyError::SyncFailed)?;
    drop(destination_file);

    let mut verified_file = File::open(destination).map_err(|_| VerifiedCopyError::VerifyFailed)?;
    let verified =
        Database::open(&mut verified_file, key).map_err(|_| VerifiedCopyError::VerifyFailed)?;

    if database != verified {
        return Err(VerifiedCopyError::VerifyFailed);
    }

    Ok(())
}

fn read_fixture(path: &Path) -> Result<Vec<u8>, VerifiedCopyError> {
    let file = File::open(path).map_err(|_| VerifiedCopyError::SourceUnreadable)?;
    let metadata = file
        .metadata()
        .map_err(|_| VerifiedCopyError::SourceUnreadable)?;

    if !metadata.is_file() || metadata.len() > MAX_FIXTURE_BYTES {
        return Err(VerifiedCopyError::SourceUnreadable);
    }

    let mut bytes = Vec::with_capacity(metadata.len() as usize);
    file.take(MAX_FIXTURE_BYTES + 1)
        .read_to_end(&mut bytes)
        .map_err(|_| VerifiedCopyError::SourceUnreadable)?;

    if bytes.len() as u64 > MAX_FIXTURE_BYTES {
        return Err(VerifiedCopyError::SourceUnreadable);
    }

    Ok(bytes)
}

fn map_save_error(error: DatabaseSaveError) -> VerifiedCopyError {
    match error {
        DatabaseSaveError::UnsupportedVersion => VerifiedCopyError::UnsupportedWriteFormat,
        _ => VerifiedCopyError::WriteFailed,
    }
}

#[cfg(test)]
mod tests {
    use std::{fs, path::PathBuf};

    use keepass::{Database, DatabaseKey};
    use sha2::{Digest, Sha256};

    use super::{round_trip_fixture_copy, VerifiedCopyError};

    struct TestDestination(PathBuf);

    impl TestDestination {
        fn new() -> Self {
            Self(std::env::temp_dir().join(format!("myvault-m2a-{}.kdbx", uuid::Uuid::new_v4())))
        }
    }

    impl Drop for TestDestination {
        fn drop(&mut self) {
            match fs::remove_file(&self.0) {
                Ok(()) => {}
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
                Err(error) => panic!("temporary M2A fixture could not be removed: {error}"),
            }
        }
    }

    #[test]
    fn kdbx41_fixture_round_trips_to_a_verified_new_copy() {
        let source = fixture_path("kdbx41-aes-aeskdf-password.kdbx");
        let source_before = sha256(&source);
        let destination = TestDestination::new();

        round_trip_fixture_copy(&source, &destination.0, "demopass".to_string())
            .expect("the public KDBX 4.1 fixture should round-trip");

        assert_eq!(source_before, sha256(&source));
        assert!(destination.0.is_file());

        let mut output = fs::File::open(&destination.0).expect("copy should be readable");
        let wrong_key = DatabaseKey::new().with_password("wrong-password");
        assert!(Database::open(&mut output, wrong_key).is_err());
    }

    #[test]
    fn existing_destination_is_never_truncated() {
        let source = fixture_path("kdbx41-aes-aeskdf-password.kdbx");
        let source_before = sha256(&source);
        let destination = TestDestination::new();
        let sentinel = b"existing-file-must-survive";
        fs::write(&destination.0, sentinel).expect("sentinel should be created");

        let result = round_trip_fixture_copy(&source, &destination.0, "demopass".to_string());

        assert_eq!(result, Err(VerifiedCopyError::DestinationExists));
        assert_eq!(
            fs::read(&destination.0).expect("sentinel should remain"),
            sentinel
        );
        assert_eq!(source_before, sha256(&source));
    }

    #[test]
    fn non_kdbx41_fixture_is_rejected_before_destination_creation() {
        let source = fixture_path("kdbx40-aes-argon2id-password.kdbx");
        let source_before = sha256(&source);
        let destination = TestDestination::new();

        let result = round_trip_fixture_copy(&source, &destination.0, "demopass".to_string());

        assert_eq!(result, Err(VerifiedCopyError::UnsupportedWriteFormat));
        assert!(!destination.0.exists());
        assert_eq!(source_before, sha256(&source));
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
