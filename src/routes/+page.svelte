<script lang="ts">
	import { page } from "$app/state";
	import {
		PUBLIC_TWITCH_CLIENT_ID,
		PUBLIC_TWITCH_REDIRECT_URL,
	} from "$env/static/public";
	import { SCOPES } from "$lib/scopes";

	const generatedState = crypto.randomUUID();

	const authSearchParams = {
		client_id: PUBLIC_TWITCH_CLIENT_ID,
		redirect_uri: PUBLIC_TWITCH_REDIRECT_URL,
		response_type: "token",
		scope: SCOPES.join(" "),
		state: generatedState,
	};

	async function signIn() {
		const authUrl = new URL("https://id.twitch.tv/oauth2/authorize");

		for (const [key, value] of Object.entries(authSearchParams)) {
			authUrl.searchParams.set(key, value);
		}

		location.href = authUrl.toString();
	}
</script>

{#if page.data.user}
	{page.data.user.display_name}
{:else}
	<button
		class="bg-neutral-300 px-3 py-2 hover:bg-neutral-200"
		onclick={signIn}
	>
		sign in
	</button>
{/if}
