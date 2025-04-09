<script lang="ts">
	import type { SystemMessage } from "$lib/chat";

	const { message }: { message: SystemMessage } = $props();
</script>

<p>{message.text}</p>
