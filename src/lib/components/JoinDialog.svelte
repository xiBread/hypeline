<script lang="ts">
	import { Dialog } from "bits-ui";
	import { Channel } from "$lib/channel.svelte";
	import { settings } from "$lib/settings";
	import { app } from "$lib/state.svelte";
	import Input from "./ui/Input.svelte";

	let { open = $bindable(false) } = $props();

	async function join(event: SubmitEvent) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const input = form.elements.namedItem("name") as HTMLInputElement;

		try {
			await app.joined?.leave();
			const channel = await Channel.join(input.value);

			app.ephemeral.add(channel);
			app.setJoined(channel);

			settings.state.lastJoined = `ephemeral:${channel.user.username}`;
		} catch (err) {
			app.setJoined(null);
			settings.state.lastJoined = null;
		} finally {
			open = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50"
		/>

		<Dialog.Content
			class="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border p-4 shadow-lg duration-200"
		>
			<div>
				<Dialog.Title class="text-xl font-semibold">Join a channel</Dialog.Title>

				<p class="text-muted-foreground text-sm">
					This channel will only last during the current session. Qutting the application
					will automatically leave the channel and remove it from the channel list.
				</p>
			</div>

			<form class="space-y-4" onsubmit={join}>
				<div>
					<label class="mb-1.5 block text-sm font-medium" for="name">Channel name</label>
					<Input id="name" type="text" autocapitalize="off" autocorrect="off" />
				</div>

				<div class="flex justify-end">
					<button
						class="bg-twitch rounded-md px-3.5 py-2 text-sm font-medium text-white"
						type="submit"
					>
						Join
					</button>
				</div>
			</form>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
