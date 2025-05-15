<script lang="ts">
	import { UserMessage } from "../../message";
	import Announcement from "./Announcement.svelte";
	import Raid from "./Raid.svelte";
	import Sub from "./Sub.svelte";

	const { message }: { message: UserMessage } = $props();
</script>

{#if message.event}
	{@const { type } = message.event}

	{#if type === "announcement"}
		<Announcement {message} color={message.event.color} />
	{:else if type === "raid"}
		<Raid {message} raid={message.event} />
	{:else if type === "sub_or_resub" || type === "sub_mystery_gift" || type === "sub_gift"}
		<Sub {message} sub={message.event} />
	{/if}
{/if}
