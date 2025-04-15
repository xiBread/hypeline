<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { onMount, tick } from "svelte";
	import { goto } from "$app/navigation";
	import { AuthUser } from "$lib/auth-user.svelte";
	import { app, settings } from "$lib/state.svelte";
	import type { User } from "$lib/twitch/api";

	onMount(async () => {
		const [token] = location.hash.slice(1).split("=")[1].split("&");
		await invoke("set_access_token", { token });

		const user = await invoke<User>("get_current_user");

		app.user = new AuthUser(user, token);
		app.user.loadFollowing();

		settings.state.user = { id: user.id, token };

		await tick();
		await settings.save();

		await goto("/");
	});
</script>
