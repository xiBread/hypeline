<script lang="ts">
	import { SystemMessage } from "$lib/message";

	const { message }: { message: SystemMessage } = $props();
</script>

<div class="text-muted-foreground px-2 py-1">
	<p>{message.text}</p>
</div>
