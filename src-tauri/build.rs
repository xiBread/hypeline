fn main() {
    println!("cargo:rustc-check-cfg=cfg(local)");

    if std::env::var("USE_LOCAL_EVENTSUB").is_ok() {
        println!("cargo:rustc-cfg=local")
    }

    tauri_build::build()
}
