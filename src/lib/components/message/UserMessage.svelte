<script lang="ts">
	import { onMount } from "svelte";
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import { replyTarget } from "../Input.svelte";
	import QuickActions from "../QuickActions.svelte";
	import Message from "./Message.svelte";

	const { message }: { message: UserMessage } = $props();

	let quickActionsOpen = $state(false);

	onMount(() => {
		if (!app.active.users.has(message.user.id)) {
			app.active.users.set(message.user.id, message.user);
		}
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="group relative"
	onmouseenter={() => (quickActionsOpen = true)}
	onmouseleave={() => (quickActionsOpen = false)}
>
	{#if quickActionsOpen}
		<QuickActions
			class="absolute top-0 right-2 -translate-y-1/2"
			{message}
		/>
	{/if}

	{#if message.highlighted}
		<div class="my-0.5 border-x-6" style:border-color={app.active.color}>
			<div class="bg-muted/50 p-1.5">
				<Message {message} />
			</div>
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
				{@const user = app.active.users.get(
					message.reply.parent_user_id,
				)}

				<div class="mb-1 flex items-center gap-2">
					<div
						class="border-muted-foreground mt-1 ml-2 h-2 w-6 rounded-tl-lg border-2 border-r-0 border-b-0"
					></div>

					<div class="line-clamp-1 text-xs">
						<span style:color={user?.color}
							>@{message.reply.parent_user_name}</span
						>:
						<p class="text-muted-foreground inline">
							{message.reply.parent_message_body}
						</p>
					</div>
				</div>
			{/if}

			<Message {message} />
		</div>
	{/if}
</div>
