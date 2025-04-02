<script lang="ts">
	import { page } from "$app/state";
	import Chat from "$lib/components/Chat.svelte";
	import Input from "$lib/components/Input.svelte";

	const isLoggedIn = $derived(!!page.data.user);
</script>

<div class="flex h-screen flex-col">
	<Chat class="grow" />

	<div class="border-t p-2">
		<Input
			class="focus-visible:ring-twitch focus-visible:border-twitch focus-visible:ring-1"
			type="text"
			disabled={!isLoggedIn}
			placeholder={isLoggedIn
				? "Send a message"
				: "Log in to start chatting"}
			maxlength={500}
			autocapitalize="off"
			autocorrect="off"
		/>
	</div>
</div>
