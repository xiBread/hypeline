<script lang="ts">
	import ClipboardCopy from "@lucide/svelte/icons/clipboard-copy";
	import { Toolbar } from "bits-ui";
	import type { UserMessage } from "$lib/message";
	import { cn } from "$lib/util";

	interface Props {
		class?: string;
		message: UserMessage;
	}

	const { class: className, message }: Props = $props();

	async function copy() {
		await navigator.clipboard.writeText(message.text);
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
</Toolbar.Root>
