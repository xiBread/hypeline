<script lang="ts">
	import { SystemMessage } from "$lib/message";

	const { message }: { message: SystemMessage } = $props();
</script>

<p>{message.text}</p>
