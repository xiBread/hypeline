<script lang="ts">
	import { UserMessage } from "../../message";
	import Announcement from "./Announcement.svelte";
	import Sub from "./Sub.svelte";

	const { message }: { message: UserMessage } = $props();
</script>

{#if message.event}
	{@const { type } = message.event}

	{#if type === "announcement"}
		<Announcement {message} color={message.event.color} />
	{:else if type === "sub_or_resub"}
		<Sub {message} sub={message.event} />
	{/if}
{/if}
