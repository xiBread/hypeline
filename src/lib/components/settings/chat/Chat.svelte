<script lang="ts">
	import Highlights from "./Highlights.svelte";
	import Messages from "./Messages.svelte";
</script>

<div class="space-y-6">
	<h1>Chat</h1>

	<div class="divide-border divide-y *:py-6 *:first:pt-0 *:last:pb-0">
		<Highlights />
		<Messages />
	</div>
</div>
