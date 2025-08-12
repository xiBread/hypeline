<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type {
		GiftPaidUpgradeEvent,
		PrimePaidUpgradeEvent,
		SubGiftEvent,
		SubMysteryGiftEvent,
		SubOrResubEvent,
	} from "$lib/twitch/irc";
	import { colorizeName, find } from "$lib/util";
	import Message from "./Message.svelte";

	interface Props {
		message: UserMessage;
		sub:
			| SubOrResubEvent
			| SubMysteryGiftEvent
			| SubGiftEvent
			| PrimePaidUpgradeEvent
			| GiftPaidUpgradeEvent;
	}

	const { message, sub }: Props = $props();
</script>

<div class="bg-muted/50 my-0.5 border-l-4 p-2" style:border-color={app.joined?.user.color}>
	<div class="flex gap-1">
		{#if sub.type === "sub_or_resub" || sub.type === "prime_paid_upgrade" || sub.type === "gift_paid_upgrade"}
			{#if sub.type === "sub_or_resub" && sub.sub_plan === "Prime"}
				<svg class="fill-current" width="20" height="20" viewBox="0 0 20 20">
					<g>
						<path
							fill-rule="evenodd"
							clip-rule="evenodd"
							d="M18 5v8a2 2 0 0 1-2 2H4a2.002 2.002 0 0 1-2-2V5l4 3 4-4 4 4 4-3z"
						/>
					</g>
				</svg>
			{:else}
				<svg
					class="fill-current stroke-current stroke-2"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path
						d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"
					/>
				</svg>
			{/if}
		{:else}
			<span class="iconify lucide--gift mt-px size-4 shrink-0"></span>
		{/if}

		{#if sub.type === "sub_or_resub"}
			<div class="flex flex-col gap-0.5">
				{@html colorizeName(message.author)}

				<p>
					Subscribed with

					{#if sub.sub_plan === "Prime"}
						{@render prime()}
					{:else}
						<span class="font-semibold">Tier {sub.sub_plan[0]}</span>
					{/if}.

					{#if sub.cumulative_months > 1}
						They've subscribed for
						<span class="font-semibold">{sub.cumulative_months} months</span
						>{#if sub.streak_months}
							, currently on a
							<span class="font-semibold">{sub.streak_months} month</span>
							streak
						{/if}!
					{/if}
				</p>
			</div>
		{:else if sub.type === "sub_mystery_gift"}
			{@const singular = sub.mass_gift_count === 1}

			<div class="flex flex-col gap-0.5">
				{@html colorizeName(message.author)}

				<p>
					Gifting
					{singular ? "a" : sub.mass_gift_count}
					<span class="font-semibold"> Tier {sub.sub_plan[0]}</span>
					sub{singular ? null : "s"}!

					{#if sub.sender_total_gifts && sub.sender_total_gifts > sub.mass_gift_count}
						They've gifted a total of
						<span class="font-semibold">{sub.sender_total_gifts} subs</span> to the channel.
					{/if}
				</p>
			</div>
		{:else if sub.type === "prime_paid_upgrade"}
			<div class="flex flex-col gap-0.5">
				{@html colorizeName(message.author)}

				<p>
					Converted their {@render prime()} sub to a
					<span class="font-semibold">Tier {sub.sub_plan[0]}</span> sub!
				</p>
			</div>
		{:else if sub.type === "gift_paid_upgrade"}
			{@const gifter = find(
				app.joined?.viewers ?? [],
				(u) => u.username === sub.gifter_login,
			)}

			<div class="flex flex-col gap-0.5">
				{@html colorizeName(message.author)}

				<p>
					Continuing the gifted sub they got from {#if gifter}
						{@html colorizeName(gifter)}
					{:else}
						<span class="font-semibold">{sub.gifter_name}</span>
					{/if}
				</p>
			</div>
		{:else}
			{@const recipient = app.joined?.viewers.get(sub.recipient.id)}

			{#snippet tier()}
				<span class="font-semibold">Tier {sub.sub_plan[0]}</span>
			{/snippet}

			<p>
				{#if sub.is_sender_anonymous}
					<span class="font-semibold">An Anonymous Viewer</span>
				{:else}
					{@html colorizeName(message.author)}
				{/if}

				gifted {#if sub.num_gifted_months > 1}
					{sub.num_gifted_months} months of a {@render tier()} sub
				{:else}
					a {@render tier()} sub
				{/if}

				to {#if recipient}
					{@html colorizeName(recipient)}
				{:else}
					<span class="font-semibold">{sub.recipient.name}</span>
				{/if}!

				{#if sub.sender_total_months > sub.num_gifted_months}
					They've gifted a total of
					<span class="font-semibold">{sub.sender_total_months} months</span>
					of subs to the channel.
				{/if}
			</p>
		{/if}
	</div>

	{#if message.data.message_text}
		<div class="mt-2">
			<Message {message} />
		</div>
	{/if}
</div>

{#snippet prime()}
	<a class="text-twitch-link font-medium underline" href="https://gaming.amazon.com/home">
		Prime
	</a>
{/snippet}
