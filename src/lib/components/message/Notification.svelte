<script lang="ts">
	import { UserMessage } from "../../message";
	import Announcement from "./Announcement.svelte";
	import Resub from "./Resub.svelte";

	const { message }: { message: UserMessage } = $props();
</script>

{#if message.announcement}
	<Announcement {message} color={message.announcement.color} />
{:else if message.resub}
	<Resub {message} resub={message.resub} />
{/if}
