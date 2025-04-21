<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { onMount, tick } from "svelte";
	import { goto } from "$app/navigation";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import { User } from "$lib/user";

	onMount(async () => {
		const [token] = location.hash.slice(1).split("=")[1].split("&");
		await invoke("set_access_token", { token });

		app.user = await User.from(null);
		settings.state.user = { id: app.user.id, token };

		await tick();
		await settings.save();

		await goto("/");
	});
</script>
