<script lang="ts">
	import type { NotificationMessage } from "$lib/message";
	import Announcement from "./Announcement.svelte";

	const { message }: { message: NotificationMessage } = $props();
</script>

{#if message.isAnnouncement()}
	<Announcement {message} color={message.announcement.color} />
{/if}
