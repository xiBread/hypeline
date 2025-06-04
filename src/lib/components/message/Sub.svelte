<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type { SubGiftEvent, SubMysteryGiftEvent, SubOrResubEvent } from "$lib/twitch/irc";
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
		let msg = `Gifted `;

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

<div class="bg-muted/50 my-0.5 border-l-4 p-2" style:border-color={app.joined?.user.color}>
	<div class="flex gap-1">
		<span
			class={[
				"iconify mt-px size-4 shrink-0",
				sub.type === "sub_or_resub" ? "lucide--star" : "lucide--gift",
			]}
		></span>

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
			<div class="flex flex-col gap-0.5">
				{#if sub.is_sender_anonymous}
					<span class="font-semibold">An Anonymous Viewer</span>
				{:else}
					<span class="font-semibold" style:color={message.viewer.color}>
						{message.viewer.displayName}
					</span>
				{/if}

				<p>{@html giftMessage(sub)}</p>
			</div>
		{/if}
	</div>

	{#if message.data.message_text}
		<div class="mt-2">
			<Message {message} />
		</div>
	{/if}
</div>
