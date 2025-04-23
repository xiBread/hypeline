<script lang="ts">
	import ClipboardCopy from "@lucide/svelte/icons/clipboard-copy";
	import Reply from "@lucide/svelte/icons/reply";
	import Trash from "@lucide/svelte/icons/trash";
	import { invoke } from "@tauri-apps/api/core";
	import { Separator, Toolbar } from "bits-ui";
	import { input, replyTarget } from "$lib/components/Input.svelte";
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
		if (!app.user) return;

		await invoke("delete_message", {
			broadcasterId: app.active.user.id,
			userId: app.user.id,
			messageId: message.id,
		});
	}
</script>

<Toolbar.Root
	class={cn(
		"bg-muted flex items-center gap-x-1 rounded-sm border p-0.5",
		className,
	)}
>
	<Toolbar.Button
		class="hover:bg-muted-foreground/50 flex items-center justify-center rounded-[4px] p-1"
		title="Copy message"
		onclick={copy}
	>
		<ClipboardCopy class="size-4" />
	</Toolbar.Button>

	<Toolbar.Button
		class="hover:bg-muted-foreground/50 flex items-center justify-center rounded-[4px] p-1"
		title="Reply to {message.user.displayName}"
		onclick={() => {
			replyTarget.value = message;
			input.value?.focus();
		}}
	>
		<Reply class="size-4" />
	</Toolbar.Button>

	{#if message.actionable}
		<Separator.Root class="bg-border h-4 w-px" orientation="vertical" />

		<Toolbar.Button
			class="hover:bg-muted-foreground/50 flex items-center justify-center rounded-[4px] p-1"
			title="Delete message"
			onclick={deleteMessage}
		>
			<Trash class="size-4" />
		</Toolbar.Button>
	{/if}
</Toolbar.Root>
