use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PrototypeStatus {
    milestone: &'static str,
    secure_for_real_credentials: bool,
}

#[tauri::command]
pub fn prototype_status() -> PrototypeStatus {
    PrototypeStatus {
        milestone: "M0-product-shell",
        secure_for_real_credentials: false,
    }
}
