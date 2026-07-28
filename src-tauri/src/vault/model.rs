use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenKdbxRequest {
    pub path: String,
    pub password: String,
    pub key_file_path: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CloseKdbxRequest {
    pub session_id: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenKdbxResult {
    pub session_id: String,
    pub database: VaultDatabaseSummary,
    pub capabilities: VaultCapabilities,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultDatabaseSummary {
    pub name: String,
    pub format: String,
    pub groups: Vec<VaultGroupSummary>,
    pub entries: Vec<VaultEntrySummary>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultGroupSummary {
    pub id: String,
    pub parent_id: Option<String>,
    pub name: String,
    pub depth: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultEntrySummary {
    pub id: String,
    pub group_id: String,
    pub title: String,
    pub username: String,
    pub url: String,
    pub favorite: bool,
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VaultCapabilities {
    pub read: bool,
    pub write: bool,
    pub reveal_secrets: bool,
}

impl VaultCapabilities {
    pub fn read_only() -> Self {
        Self {
            read: true,
            write: false,
            reveal_secrets: false,
        }
    }
}
