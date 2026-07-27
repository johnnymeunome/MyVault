use keepass::{
    db::{DatabaseFormatError, DatabaseOpenError},
    error::{DatabaseKeyError, Kdbx3OpenError, Kdbx4OpenError},
};
use serde::Serialize;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum VaultError {
    FileNotFound,
    FileUnreadable,
    UnsupportedVersion,
    InvalidKey,
    IntegrityFailed,
    FormatInvalid,
    ResourceLimitExceeded,
    Internal,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicVaultError {
    pub code: VaultErrorCode,
    pub message: &'static str,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum VaultErrorCode {
    FileNotFound,
    FileUnreadable,
    UnsupportedVersion,
    InvalidKey,
    IntegrityFailed,
    FormatInvalid,
    ResourceLimitExceeded,
    Internal,
}

impl From<VaultError> for PublicVaultError {
    fn from(value: VaultError) -> Self {
        match value {
            VaultError::FileNotFound => Self {
                code: VaultErrorCode::FileNotFound,
                message: "O arquivo selecionado não foi encontrado.",
            },
            VaultError::FileUnreadable => Self {
                code: VaultErrorCode::FileUnreadable,
                message: "O arquivo não pôde ser lido.",
            },
            VaultError::UnsupportedVersion => Self {
                code: VaultErrorCode::UnsupportedVersion,
                message: "Esta versão do KDBX ainda não é suportada.",
            },
            VaultError::InvalidKey => Self {
                code: VaultErrorCode::InvalidKey,
                message: "A senha ou o arquivo-chave não foi aceito.",
            },
            VaultError::IntegrityFailed => Self {
                code: VaultErrorCode::IntegrityFailed,
                message: "A verificação de integridade do arquivo falhou.",
            },
            VaultError::FormatInvalid => Self {
                code: VaultErrorCode::FormatInvalid,
                message: "O conteúdo não é um arquivo KDBX válido.",
            },
            VaultError::ResourceLimitExceeded => Self {
                code: VaultErrorCode::ResourceLimitExceeded,
                message: "O arquivo excede os limites do modo experimental.",
            },
            VaultError::Internal => Self {
                code: VaultErrorCode::Internal,
                message: "O MyVault não conseguiu concluir a abertura.",
            },
        }
    }
}

impl From<DatabaseOpenError> for VaultError {
    fn from(value: DatabaseOpenError) -> Self {
        match value {
            DatabaseOpenError::Io(error) if error.kind() == std::io::ErrorKind::NotFound => {
                Self::FileNotFound
            }
            DatabaseOpenError::Io(_) => Self::FileUnreadable,
            DatabaseOpenError::UnsupportedVersion => Self::UnsupportedVersion,
            DatabaseOpenError::Key(DatabaseKeyError::IncorrectKey) => Self::InvalidKey,
            DatabaseOpenError::Key(_) | DatabaseOpenError::Cryptography(_) => Self::InvalidKey,
            DatabaseOpenError::Format(DatabaseFormatError::Kdbx4(
                Kdbx4OpenError::HeaderHashMismatch | Kdbx4OpenError::BlockStream(_),
            ))
            | DatabaseOpenError::Format(DatabaseFormatError::Kdbx3(
                Kdbx3OpenError::BlockHashMismatch(_),
            )) => Self::IntegrityFailed,
            DatabaseOpenError::UnexpectedEof
            | DatabaseOpenError::VersionParse(_)
            | DatabaseOpenError::Format(_) => Self::FormatInvalid,
            _ => Self::Internal,
        }
    }
}
