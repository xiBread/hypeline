<script lang="ts">
	import { SystemMessage } from "$lib/message";
	import Timestamp from "../Timestamp.svelte";

	const { message }: { message: SystemMessage } = $props();
</script>

<div class={["text-muted-foreground px-3 py-2", message.deleted && "opacity-30"]}>
	<Timestamp date={message.timestamp} />
	<p class="inline">{@html message.text}</p>
</div>
