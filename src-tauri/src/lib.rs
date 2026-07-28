mod commands;
mod security;
mod vault;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(vault::VaultState::default())
        .invoke_handler(tauri::generate_handler![
            commands::system::prototype_status,
            commands::vault::open_kdbx_read_only,
            commands::vault::close_kdbx_session,
            commands::vault::clear_kdbx_sessions
        ])
        .run(tauri::generate_context!())
        .expect("failed to start MyVault");
}
