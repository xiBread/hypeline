<script lang="ts">
	import "../app.css";
	import { onMount } from "svelte";
	import { settings } from "$lib/settings.svelte";
	import type { AuthUser, FollowedChannel } from "$lib/twitch-api";
	import ChannelList from "$lib/components/ChannelList.svelte";
	import { invoke } from "@tauri-apps/api/core";

	const { children, data } = $props();

	let channels = $state<FollowedChannel[]>([]);

	onMount(async () => {
		channels = await invoke<FollowedChannel[]>("get_followed_channels");

		// Sort online by viewer count, then offline by name
		channels.sort((a, b) => {
			if (a.stream && b.stream) {
				return b.stream.viewer_count - a.stream.viewer_count;
			}

			if (a.stream && !b.stream) return -1;
			if (!a.stream && b.stream) return 1;

			return a.user_name.localeCompare(b.user_name);
		});

		settings.user = await data.settingsStore.get<AuthUser>("user");
		const user = settings.user;

		if (user) {
			channels.unshift({
				user_id: user.id,
				user_login: user.login,
				user_name: user.display_name,
				profile_image_url: user.profile_image_url,
				stream: null,
			});
		}
	});
</script>

<div class="flex">
	<ChannelList {channels} />

	<main class="grow">
		{@render children()}
	</main>
</div>
