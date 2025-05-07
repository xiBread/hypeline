<script lang="ts">
	import { onMount } from "svelte";
	import { goto } from "$app/navigation";
	import { settings } from "$lib/settings";
	import { connect } from "$lib/twitch";

	onMount(async () => {
		if (!settings.state.user) return;

		await connect();

		if (settings.state.lastJoined) {
			await goto(`/${settings.state.lastJoined}`);
		}
	});
</script>

<div class="flex size-full items-center justify-center">
	<p class="text-center">
		Select a channel from your following list to start chatting
	</p>
</div>
