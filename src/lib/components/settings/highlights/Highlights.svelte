<script lang="ts">
	import Custom from "./Custom.svelte";
	import Viewers from "./Viewers.svelte";
</script>

<div class="space-y-6">
	<hgroup>
		<h1 class="mb-2">Highlights</h1>

		<p class="text-muted-foreground mr-8 text-sm">
			Message highlights allow you to easily identify different types of viewers or when
			specific keywords are sent in chat.
		</p>
	</hgroup>

	<div class="divide-border divide-y *:py-6 *:first:pt-0 *:last:pb-0">
		<Viewers />
		<Custom />
	</div>
</div>
