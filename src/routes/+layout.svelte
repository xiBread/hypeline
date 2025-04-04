<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { settings } from "$lib/settings.svelte";
	import type { AuthUser } from "$lib/twitch-api";
	import { page } from "$app/state";

	const { children } = $props();

	onMount(async () => {
		settings.user = await page.data.settingsStore.get<AuthUser>("user");
	});
</script>

{@render children()}
