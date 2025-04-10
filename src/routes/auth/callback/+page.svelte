<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { onMount, tick } from "svelte";
	import { goto } from "$app/navigation";
	import { app, settings } from "$lib/state.svelte";
	import type { User } from "$lib/twitch";

	onMount(async () => {
		const [token] = location.hash.slice(1).split("=")[1].split("&");
		await invoke("set_access_token", { token });

		const user = await invoke<User>("get_current_user");
		settings.state.user = { ...user, token };

		await tick();
		await settings.save();

		app.channels = await invoke("get_followed");
		await goto("/");
	});
</script>
