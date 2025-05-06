<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { listen } from "@tauri-apps/api/event";
	import type { UnlistenFn } from "@tauri-apps/api/event";
	import { info } from "@tauri-apps/plugin-log";
	import { openUrl } from "@tauri-apps/plugin-opener";
	import { onDestroy, onMount, tick } from "svelte";
	import { goto } from "$app/navigation";
	import {
		PUBLIC_TWITCH_CLIENT_ID,
		PUBLIC_TWITCH_REDIRECT_URL,
	} from "$env/static/public";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import { SCOPES } from "$lib/twitch";
	import { User } from "$lib/user";

	const params = {
		client_id: PUBLIC_TWITCH_CLIENT_ID,
		redirect_uri: PUBLIC_TWITCH_REDIRECT_URL,
		response_type: "token",
		scope: SCOPES.join(" "),
	};

	const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");

	for (const [key, value] of Object.entries(params)) {
		authUrl.searchParams.set(key, value);
	}

	let unlisten: UnlistenFn | undefined;

	onMount(async () => {
		await invoke("start_server");

		unlisten = await listen<string>("accesstoken", async (event) => {
			app.user = await User.from(null);
			settings.state.user = { id: app.user.id, token: event.payload };

			await tick();
			await settings.save();

			await goto("/");
		});
	});

	onDestroy(async () => {
		await invoke("stop_server");
		unlisten?.();
	});

	async function openAuth() {
		await openUrl(authUrl.toString());
	}
</script>

<div class="flex h-screen items-center justify-center">
	<button
		class="bg-twitch m-auto flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-white"
		type="button"
		onclick={openAuth}
	>
		<svg
			class="size-5 fill-white"
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
			/>
		</svg>

		Log in with Twitch
	</button>
</div>
