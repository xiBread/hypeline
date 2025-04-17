<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { onMount, tick } from "svelte";
	import { goto } from "$app/navigation";
	import { AuthUser } from "$lib/auth-user.svelte";
	import { app, settings } from "$lib/state.svelte";

	onMount(async () => {
		const [token] = location.hash.slice(1).split("=")[1].split("&");
		await invoke("set_access_token", { token });

		app.user = await AuthUser.load(token);
		settings.state.user = { id: app.user.id, token };

		await tick();
		await settings.save();

		await goto("/");
	});
</script>
