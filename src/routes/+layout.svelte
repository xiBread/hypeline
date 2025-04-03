<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { settings } from "$lib/settings.svelte";
	import type { User } from "$lib/auth";
	import { page } from "$app/state";

	const { children } = $props();

	onMount(async () => {
		settings.user = await page.data.settingsStore.get<User>("user");
	});
</script>

{@render children()}
