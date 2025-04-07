<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { settings } from "$lib/state.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import type { User } from "$lib/twitch-api";

	onMount(async () => {
		const [accessToken] = location.hash.slice(1).split("=")[1].split("&");

		await invoke("set_access_token", { token: accessToken });
		const user = await invoke<User>("get_current_user");

		const authUser = { ...user, accessToken };
		const userExists = await page.data.settingsStore.has("user");

		if (!userExists) {
			await page.data.settingsStore.set("user", authUser);
			await page.data.settingsStore.save();
		}

		settings.user = authUser;
		await goto("/");
	});
</script>
