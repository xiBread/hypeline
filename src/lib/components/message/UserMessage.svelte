<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import { replyTarget } from "../Input.svelte";
	import QuickActions from "../QuickActions.svelte";
	import Message from "./Message.svelte";

	const { message }: { message: UserMessage } = $props();

	let quickActionsOpen = $state(false);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class={["group relative", message.deleted && "opacity-50"]}
	onmouseenter={() => (quickActionsOpen = true)}
	onmouseleave={() => (quickActionsOpen = false)}
>
	{#if quickActionsOpen && !message.deleted}
		<QuickActions
			class="absolute top-0 right-2 -translate-y-1/2"
			{message}
		/>
	{/if}

	{#if message.highlighted}
		<div
			class="bg-muted/50 my-0.5 border-l-4 p-2.5"
			style:border-color={app.active.user.color}
		>
			<Message {message} />
		</div>
	{:else}
		<div
			class={[
				"px-3 py-2",
				replyTarget.value?.id === message.id
					? "bg-twitch/50"
					: "group-hover:bg-muted",
			]}
		>
			{#if message.reply}
				{@const viewer = app.active.viewers.get(
					message.reply.parent.user.login,
				)}

				<div class="mb-1 flex items-center gap-2">
					<div
						class="border-muted-foreground mt-1 ml-2 h-2 w-6 rounded-tl-lg border-2 border-r-0 border-b-0"
					></div>

					<div class="line-clamp-1 text-xs">
						<span style:color={viewer?.color}
							>@{message.reply.parent.user.name}</span
						>:
						<p class="text-muted-foreground inline">
							{message.reply.parent.message_text}
						</p>
					</div>
				</div>
			{/if}

			<Message {message} />
		</div>
	{/if}
</div>
