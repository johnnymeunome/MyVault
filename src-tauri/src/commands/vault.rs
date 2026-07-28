use tauri::State;

use crate::vault::{
    CloseKdbxRequest, OpenKdbxRequest, OpenKdbxResult, PublicVaultError, VaultState,
};

#[tauri::command]
pub fn open_kdbx_read_only(
    request: OpenKdbxRequest,
    state: State<'_, VaultState>,
) -> Result<OpenKdbxResult, PublicVaultError> {
    state.open_read_only(request).map_err(Into::into)
}

#[tauri::command]
pub fn close_kdbx_session(
    request: CloseKdbxRequest,
    state: State<'_, VaultState>,
) -> Result<(), PublicVaultError> {
    state.close(&request.session_id).map_err(Into::into)
}

#[tauri::command]
pub fn clear_kdbx_sessions(state: State<'_, VaultState>) -> Result<(), PublicVaultError> {
    state.clear().map_err(Into::into)
}
