import type { User } from "$lib/auth";
import type { Store } from "@tauri-apps/plugin-store";

declare global {
	namespace App {
		interface PageData {
			user: User | undefined;
			settings: Store;
		}
	}
}
