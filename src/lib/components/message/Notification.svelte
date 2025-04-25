<script lang="ts">
	import { UserMessage } from "../../message";
	import Announcement from "./Announcement.svelte";
	import Resub from "./Resub.svelte";

	const { message }: { message: UserMessage } = $props();
</script>

{#if message.event}
	{@const { type } = message.event}

	{#if type === "announcement"}
		<Announcement {message} color={message.event.color} />
	{:else if type === "sub_or_resub"}
		{#if message.event.is_resub}
			<Resub {message} resub={message.event} />
		{:else}
			<!-- <Sub {message} sub= /> -->
		{/if}
	{/if}
{/if}
