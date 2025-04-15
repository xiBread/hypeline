import { invoke } from "@tauri-apps/api/core";
import { SvelteMap } from "svelte/reactivity";
import type { Message } from "$lib/message";
import type { Channel } from "./channel.svelte";

export interface ChatUser {
	id: string;
	name: string;
	color: string;
}

export class Chat {
	public readonly users = new SvelteMap<string, ChatUser>();
	public messages = $state<Message[]>([]);

	public constructor(public readonly channel: Channel) {}

	public async loadUsers() {
		const users = await invoke<ChatUser[]>("get_chatters", {
			id: this.channel.user.id,
		});

		for (const user of users) {
			this.users.set(user.id, user);
		}
	}

	public async send(message: string) {
		await invoke("send_message", {
			content: message,
			broadcasterId: this.channel.user.id,
		});
	}
}
