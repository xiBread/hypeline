<script lang="ts">
	import { SystemMessage } from "$lib/message";

	const { message }: { message: SystemMessage } = $props();
</script>

<div class="text-muted-foreground px-3 py-2">
	<time class="text-xs" datetime={message.timestamp.toISOString()}>
		{message.formattedTime}
	</time>

	<p class="inline">{message.text}</p>
</div>
