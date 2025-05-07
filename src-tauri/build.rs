fn main() {
    println!("cargo:rustc-check-cfg=cfg(local)");

    if matches!(option_env!("USE_LOCAL_EVENTSUB"), Some(val) if val == "1") {
        println!("cargo:rustc-cfg=local")
    };

    tauri_build::build()
}
