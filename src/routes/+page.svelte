<script lang="ts">
	import { settings } from "$lib/settings";
</script>

{#if settings.state.user}
	<div class="flex size-full items-center justify-center">
		<p class="text-center">
			Select a channel from your following list to start chatting
		</p>
	</div>
{/if}
