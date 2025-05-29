<script lang="ts">
	import { settings } from "$lib/settings";
	import Switch from "../../ui/Switch.svelte";
	import Custom from "./Custom.svelte";
	import Viewers from "./Viewers.svelte";
</script>

<div class="space-y-6">
	<h1>Highlights</h1>

	<Switch bind:checked={settings.state.highlights.enabled}>
		<span class="font-medium">Highlight messages</span>

		{#snippet description()}
			Message highlights allow you to easily identify different types of viewers or when
			specific keywords are sent in chat.
		{/snippet}
	</Switch>

	<div class="divide-border divide-y *:py-6 *:first:pt-0 *:last:pb-0">
		<Viewers />
		<Custom />
	</div>
</div>
