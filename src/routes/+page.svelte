<script lang="ts">
	import { getAuthUrl } from "$lib/auth";
	import { settings } from "$lib/state.svelte";
</script>

{#if settings.state.user}
	<div class="flex size-full items-center justify-center">
		<p class="text-center">
			Select a channel from your following list to start chatting
		</p>
	</div>
{:else}
	<div class="flex h-screen items-center justify-center">
		<a
			class="bg-twitch m-auto flex items-center gap-2.5 rounded-md px-4 py-2 font-medium text-white"
			href={getAuthUrl().toString()}
		>
			<svg
				class="size-5 fill-white"
				role="img"
				viewBox="0 0 24 24"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"
				/>
			</svg>

			Log in with Twitch
		</a>
	</div>
{/if}
