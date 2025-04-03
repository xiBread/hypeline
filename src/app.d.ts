import type { LazyStore } from "@tauri-apps/plugin-store";

declare global {
	namespace App {
		interface PageData {
			settingsStore: LazyStore;
		}
	}
}
