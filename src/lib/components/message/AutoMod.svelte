<script lang="ts">
	import type { UserMessage, UserMessageAutoModMetadata } from "$lib/message";
	import Message from "./Message.svelte";

	interface Props {
		message: UserMessage;
		metadata: UserMessageAutoModMetadata;
	}

	const { message, metadata }: Props = $props();
</script>

<div class="bg-muted/50 my-0.5 space-y-2 border-l-4 border-red-500 p-2.5">
	<div>
		<img
			class="inline align-middle"
			src="https://static-cdn.jtvnw.net/badges/v1/df9095f6-a8a0-4cc2-bb33-d908c0adffb8/2"
			alt="AutoMod"
			width="18"
			height="18"
		/>

		<span class="text-twitch font-semibold">AutoMod</span>: Message held {metadata.reason}
		{metadata.level ? `(Level ${metadata.level})` : null}
	</div>

	<Message {message} />
</div>
