<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type {
		SubGiftEvent,
		SubMysteryGiftEvent,
		SubOrResubEvent,
	} from "$lib/twitch/irc";
	import { colorizeName } from "$lib/util";
	import { Viewer } from "$lib/viewer.svelte";
	import Message from "./Message.svelte";

	interface Props {
		message: UserMessage;
		sub: SubOrResubEvent | SubMysteryGiftEvent | SubGiftEvent;
	}

	const { message, sub }: Props = $props();

	function subMessage(sub: SubOrResubEvent) {
		let message = "Subscribed with ";

		if (sub.sub_plan === "Prime") {
			message += "Prime.";
		} else {
			message += `Tier ${sub.sub_plan[0]}.`;
		}

		if (sub.cumulative_months > 1) {
			message += ` They've subscribed for ${sub.cumulative_months} months!`;

			if (sub.streak_months) {
				message = `${message.slice(0, -1)}, currently on a ${sub.streak_months} month streak!`;
			}
		}

		return message;
	}

	function giftMessage(sub: SubGiftEvent) {
		const tier = `Tier ${sub.sub_plan[0]}`;
		const gifter = sub.is_sender_anonymous
			? "An anonymous viewer"
			: colorizeName(message.viewer);

		let msg = `${gifter} gifted `;

		if (sub.num_gifted_months > 1) {
			msg += `${sub.num_gifted_months} months of a ${tier} sub `;
		} else {
			msg += `a ${tier} sub `;
		}

		const recipient = Viewer.from(sub.recipient);
		msg += `to ${colorizeName(recipient)}!`;

		if (sub.sender_total_months > sub.num_gifted_months) {
			msg += ` They've gifted a total of ${sub.sender_total_months} months of subs to the channel.`;
		}

		return msg;
	}
</script>

<div
	class="bg-muted/50 my-0.5 border-l-4 p-2.5"
	style:border-color={app.active.user.color}
>
	<div class="flex gap-1">
		{#if sub.type === "sub_or_resub"}
			<span class="iconify lucide--star mt-px size-4"></span>
		{:else}
			<span class="iconify lucide--gift mt-px size-4"></span>
		{/if}

		{#if sub.type === "sub_or_resub"}
			<div class="flex flex-col gap-0.5">
				<span class="font-semibold" style:color={message.viewer.color}>
					{message.viewer.displayName}
				</span>

				<p>{subMessage(sub)}</p>
			</div>
		{:else if sub.type === "sub_mystery_gift"}
			<p>
				{@html colorizeName(message.viewer)} is gifting {sub.mass_gift_count}
				Tier {sub.sub_plan[0]} subs! They've gifted a total of {sub.sender_total_gifts}
				subs to the channel.
			</p>
		{:else}
			<p>{@html giftMessage(sub)}</p>
		{/if}
	</div>

	{#if message.data.message_text}
		<div class="mt-2">
			<Message {message} />
		</div>
	{/if}
</div>
