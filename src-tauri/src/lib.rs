mod commands;
mod security;
mod vault;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![commands::system::prototype_status])
        .run(tauri::generate_context!())
        .expect("failed to start MyVault");
}
