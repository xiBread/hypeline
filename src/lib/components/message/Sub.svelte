<script lang="ts">
	import Star from "@lucide/svelte/icons/star";
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type { SubOrResubEvent } from "$lib/twitch/irc";
	import Message from "./Message.svelte";

	interface Props {
		message: UserMessage;
		sub: SubOrResubEvent;
	}

	const { message, sub }: Props = $props();

	function subMessage() {
		let message = "Subscribed with ";

		if (sub.sub_plan === "Prime") {
			message += "Prime.";
		} else {
			message += `Tier ${sub.sub_plan[0]}.`;
		}

		message += ` They've subscribed for ${sub.cumulative_months} months!`;

		if (sub.streak_months) {
			message = message.slice(0, -1);
			message += `, currently on a ${sub.streak_months} month streak!`;
		}

		return message;
	}
</script>

<div
	class="bg-muted/50 my-0.5 border-l-4 p-2.5"
	style:border-color={app.active.user.color}
>
	<div class="flex gap-1">
		<Star class="fill-foreground mt-px size-4" />

		<div class="flex flex-col gap-0.5">
			<span class="font-semibold">{message.viewer.displayName}</span>
			{subMessage()}
		</div>
	</div>

	{#if message.data.message_text}
		<div class="mt-2">
			<Message {message} />
		</div>
	{/if}
</div>
