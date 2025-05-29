import { invoke } from "@tauri-apps/api/core";

export async function trace(message: string) {
	await invoke("log", { level: "trace", message });
}

export async function debug(message: string) {
	await invoke("log", { level: "debug", message });
}

export async function info(message: string) {
	await invoke("log", { level: "info", message });
}

export async function warn(message: string) {
	await invoke("log", { level: "warn", message });
}

export async function error(message: string) {
	await invoke("log", { level: "error", message });
}

export const log = {
	trace,
	debug,
	info,
	warn,
	error,
};
