<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { onMount, tick } from "svelte";
	import { goto } from "$app/navigation";
	import { settings } from "$lib/state.svelte";
	import type { User } from "$lib/twitch-api";

	onMount(async () => {
		const [token] = location.hash.slice(1).split("=")[1].split("&");
		await invoke("set_access_token", { token });

		const user = await invoke<User>("get_current_user");
		settings.state.user = { ...user, token };

		await tick();
		await settings.save();

		await goto("/");
	});
</script>
