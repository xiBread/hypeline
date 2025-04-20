<script lang="ts">
	import Star from "@lucide/svelte/icons/star";
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type { Resub } from "$lib/twitch/eventsub";
	import Message from "./Message.svelte";

	interface Props {
		message: UserMessage;
		resub: Resub;
	}

	const { message, resub }: Props = $props();

	function subMessage() {
		let message = "Subscribed with ";

		if (resub.is_prime) {
			message += "Prime.";
		} else {
			message += `Tier ${resub.sub_tier[0]}.`;
		}

		message += ` They've subscribed for ${resub.cumulative_months} months!`;

		if (resub.streak_months) {
			message = message.slice(0, -1);
			message += `, currently on a ${resub.streak_months} month streak!`;
		}

		return message;
	}
</script>

<div
	class="bg-muted/50 my-0.5 border-x-6 p-1.5"
	style:border-color={app.active.color}
>
	<div class="flex gap-1">
		<Star class="fill-foreground mt-px size-4" />

		<div class="flex flex-col gap-1">
			<span class="font-semibold">{message.user.displayName}</span>
			{subMessage()}
		</div>
	</div>

	{#if message.fragments.length}
		<Message {message} />
	{/if}
</div>
