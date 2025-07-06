<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import type { SubGiftEvent, SubMysteryGiftEvent, SubOrResubEvent } from "$lib/twitch/irc";
	import { colorizeName } from "$lib/util";
	import Message from "./Message.svelte";

	interface Props {
		message: UserMessage;
		sub: SubOrResubEvent | SubMysteryGiftEvent | SubGiftEvent;
	}

	const { message, sub }: Props = $props();
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
				<span class="font-semibold" style:color={message.author.color}>
					{message.author.displayName}
				</span>

				<p>
					Subscribed with

					{#if sub.sub_plan === "Prime"}
						<a
							class="text-twitch-link font-medium underline"
							href="https://gaming.amazon.com/home"
						>
							Prime
						</a>
					{:else}
						<span class="font-medium">Tier {sub.sub_plan[0]}</span>
					{/if}.

					{#if sub.cumulative_months > 1}
						They've subscribed for
						<span class="font-medium">{sub.cumulative_months} months</span
						>{#if sub.streak_months}
							, currently on a
							<span class="font-medium">{sub.streak_months} month</span>
							streak
						{/if}!
					{/if}
				</p>
			</div>
		{:else if sub.type === "sub_mystery_gift"}
			{@const singular = sub.mass_gift_count === 1}

			<p>
				{@html colorizeName(message.author)} is gifting
				{singular ? "a" : sub.mass_gift_count}
				<span class="font-medium"> Tier {sub.sub_plan[0]}</span>
				sub{singular ? null : "s"}!

				{#if sub.sender_total_gifts && sub.sender_total_gifts > sub.mass_gift_count}
					They've gifted a total of
					<span class="font-medium">{sub.sender_total_gifts} subs</span> to the channel.
				{/if}
			</p>
		{:else}
			{@const recipient = app.joined?.viewers.get(sub.recipient.id)}

			{#snippet tier()}
				<span class="font-medium">Tier {sub.sub_plan[0]}</span>
			{/snippet}

			<div class="flex flex-col gap-0.5">
				{#if sub.is_sender_anonymous}
					<span class="font-semibold">An Anonymous Viewer</span>
				{:else}
					<span class="font-semibold" style:color={message.author.color}>
						{message.author.displayName}
					</span>
				{/if}

				<p>
					Gifted {#if sub.num_gifted_months > 1}
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
						<span class="font-medium">{sub.sender_total_months} months</span>
						of subs to the channel.
					{/if}
				</p>
			</div>
		{/if}
	</div>

	{#if message.data.message_text}
		<div class="mt-2">
			<Message {message} />
		</div>
	{/if}
</div>
