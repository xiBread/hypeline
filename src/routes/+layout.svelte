<script lang="ts">
	import "../app.css";
	import LoaderCircle from "@lucide/svelte/icons/loader-circle";
	import { Tooltip } from "bits-ui";
	import { onMount } from "svelte";
	import { app, settings } from "$lib/state.svelte";
	import type { AuthUser, FollowedChannel } from "$lib/twitch-api";
	import ChannelList from "$lib/components/ChannelList.svelte";
	import { invoke } from "@tauri-apps/api/core";
	import { getAuthUrl } from "$lib/auth";

	const { children, data } = $props();

	let channels = $state<FollowedChannel[]>([]);

	onMount(async () => {
		app.loading = true;
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

		app.loading = false;
	});
</script>

{#if app.loading}
	<div class="flex h-screen w-screen items-center justify-center">
		<LoaderCircle class="mr-2 size-6 animate-spin" />
		<span class="text-lg">Loading...</span>
	</div>
{:else if settings.user}
	<Tooltip.Provider>
		<div class="flex">
			<ChannelList {channels} />

			<main class="grow">
				{@render children()}
			</main>
		</div>
	</Tooltip.Provider>
{:else}
	<a
		class="bg-twitch m-auto flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-white"
		href={getAuthUrl().toString()}
	>
		<svg
			class="size-5 fill-white"
			role="img"
			viewBox="0 0 24 24"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
			/>
		</svg>

		Log in with Twitch
	</a>
{/if}
