<script lang="ts">
	import Gift from "@lucide/svelte/icons/gift";
	import Star from "@lucide/svelte/icons/star";
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type { SubGiftEvent, SubOrResubEvent } from "$lib/twitch/irc";
	import type { PartialUser } from "$lib/user";
	import { colorizeName } from "$lib/util";
	import Message from "./Message.svelte";

	interface Props {
		message: UserMessage;
		sub: SubOrResubEvent | SubGiftEvent;
	}

	const { message, sub }: Props = $props();

	function subMessage(sub: SubOrResubEvent) {
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

		let recipient: PartialUser | undefined = app.active.viewers.get(
			sub.recipient.login,
		);
		recipient ??= {
			id: sub.recipient.id,
			username: sub.recipient.login,
			displayName: sub.recipient.name,
		};

		msg += `to ${colorizeName(recipient)}!`;

		return msg;
	}
</script>

<div
	class="bg-muted/50 my-0.5 border-l-4 p-2.5"
	style:border-color={app.active.user.color}
>
	<div class="flex gap-1">
		{#if sub.type === "sub_or_resub"}
			<Star class="fill-foreground mt-px size-4" />
		{:else}
			<Gift class="mt-px size-4" />
		{/if}

		{#if sub.type === "sub_or_resub"}
			<div class="flex flex-col gap-0.5">
				<span class="font-semibold" style:color={message.viewer.color}>
					{message.viewer.displayName}
				</span>

				<p>{subMessage(sub)}</p>
			</div>
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
