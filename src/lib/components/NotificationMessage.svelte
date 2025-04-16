<script lang="ts">
	import type { NotificationMessage } from "$lib/message";
	import Announcement from "./Announcement.svelte";
	import Resub from "./Resub.svelte";

	const { message }: { message: NotificationMessage } = $props();
</script>

{#if message.isAnnouncement()}
	<Announcement {message} color={message.announcement.color} />
{:else if message.isResub()}
	<Resub {message} resub={message.resub} />
{/if}
