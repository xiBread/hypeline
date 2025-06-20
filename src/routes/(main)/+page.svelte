<script lang="ts">
	import Channel from "$lib/components/Channel.svelte";
	import { settings } from "$lib/settings";
	import { connect } from "$lib/twitch";
</script>

{#await connect()}
	<div class="flex size-full items-center justify-center gap-x-2 text-lg">
		<span class="iconify lucide--loader-circle size-6 animate-spin"></span>
		Loading
	</div>
{:then}
	{#if settings.state.lastJoined}
		<Channel username={settings.state.lastJoined} />
	{:else}
		<div class="flex size-full items-center justify-center">
			<p class="text-center">Select a channel from your following list to start chatting</p>
		</div>
	{/if}
{/await}
