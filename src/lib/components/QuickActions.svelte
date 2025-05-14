<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { Separator, Toolbar } from "bits-ui";
	import { input, replyTarget } from "$lib/components/ChatInput.svelte";
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import { cn } from "$lib/util";

	interface Props {
		class?: string;
		message: UserMessage;
	}

	const { class: className, message }: Props = $props();

	async function copy() {
		await navigator.clipboard.writeText(message.text);
	}

	async function deleteMessage() {
		if (!app.user || !app.active) return;

		await invoke("delete_message", {
			broadcasterId: app.active.user.id,
			userId: app.user.id,
			messageId: message.id,
		});
	}
</script>

<Toolbar.Root class={cn("bg-muted flex items-center gap-x-1 rounded-sm border p-0.5", className)}>
	<Toolbar.Button
		class="hover:bg-muted-foreground/50 flex items-center justify-center rounded-[4px] p-1"
		title="Copy message"
		onclick={copy}
	>
		<span class="lucide--clipboard iconify size-4"></span>
	</Toolbar.Button>

	<Toolbar.Button
		class="hover:bg-muted-foreground/50 flex items-center justify-center rounded-[4px] p-1"
		title="Reply to {message.viewer.displayName}"
		onclick={() => {
			replyTarget.value = message;
			input.value?.focus();
		}}
	>
		<span class="iconify lucide--reply size-4"></span>
	</Toolbar.Button>

	{#if message.actionable}
		<Separator.Root class="bg-border h-4 w-px" orientation="vertical" />

		<Toolbar.Button
			class="hover:bg-muted-foreground/50 flex items-center justify-center rounded-[4px] p-1"
			title="Delete message"
			onclick={deleteMessage}
		>
			<span class="iconify lucide--trash size-4"></span>
		</Toolbar.Button>
	{/if}
</Toolbar.Root>
