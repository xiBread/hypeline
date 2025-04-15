<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { onMount, tick } from "svelte";
	import { goto } from "$app/navigation";
	import { AuthUser } from "$lib/auth-user.svelte";
	import { app, settings } from "$lib/state.svelte";
	import type { UserWithColor } from "$lib/tauri";

	onMount(async () => {
		const [token] = location.hash.slice(1).split("=")[1].split("&");
		await invoke("set_access_token", { token });

		const user = await invoke<UserWithColor>("get_user_from_id", {
			id: null,
		});

		app.user = new AuthUser(user.data, token);
		app.user.setColor(user.color);

		await app.user.loadFollowing();

		settings.state.user = { id: user.data.id, token };

		await tick();
		await settings.save();

		await goto("/");
	});
</script>
