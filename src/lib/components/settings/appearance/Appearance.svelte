<script lang="ts">
	import Theme from "./Theme.svelte";
	import Timestamps from "./Timestamps.svelte";
</script>

<div class="space-y-6">
	<h1>Appearance</h1>

	<div class="divide-border divide-y *:py-6 *:first:pt-0 *:last:pb-0">
		<Theme />
		<Timestamps />
	</div>
</div>
