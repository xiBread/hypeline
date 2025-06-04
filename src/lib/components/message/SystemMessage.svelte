<script lang="ts">
	import { SystemMessage } from "$lib/message";
	import type {
		AutoModContext,
		BanStatusContext,
		ClearContext,
		DeleteContext,
		EmoteSetUpdateContext,
		ModeContext,
		RoleStatusContext,
		StreamStatusContext,
		SuspicionStatusContext,
		SystemMessageContext,
		TermContext,
		TimeoutContext,
		UnbanRequestContext,
		WarnContext,
	} from "$lib/message";
	import { colorizeName, formatDuration } from "$lib/util";
	import Timestamp from "../Timestamp.svelte";

	interface Props {
		message: SystemMessage;
		context: SystemMessageContext | null;
	}

	const { message, context: ctx }: Props = $props();

	// Make these nonreactive
	// svelte-ignore non_reactive_update
	let monitored = false;
	// svelte-ignore non_reactive_update
	let restricted = false;

	if (ctx?.type === "suspicionStatus") {
		monitored = ctx.user.monitored;
		restricted = ctx.user.restricted;
	}
</script>

<div class={["text-muted-foreground px-3 py-2", message.deleted && "opacity-30"]}>
	<Timestamp date={message.timestamp} />

	<p class="inline">
		{#if ctx}
			{#if ctx.type === "autoMod"}
				{@render autoMod(ctx)}
			{:else if ctx.type === "banStatus"}
				{@render banStatus(ctx)}
			{:else if ctx.type === "clear"}
				{@render clear(ctx)}
			{:else if ctx.type === "delete"}
				{@render deleteMsg(ctx)}
			{:else if ctx.type === "emoteSetUpdate"}
				{@render emoteSetUpdate(ctx)}
			{:else if ctx.type === "join"}
				Joined {@html colorizeName(ctx.channel)}
			{:else if ctx.type === "mode"}
				{@render mode(ctx)}
			{:else if ctx.type === "roleStatus"}
				{@render roleStatus(ctx)}
			{:else if ctx.type === "streamStatus"}
				{@render streamStatus(ctx)}
			{:else if ctx.type === "suspicionStatus"}
				{@render suspicionStatus(ctx)}
			{:else if ctx.type === "term"}
				{@render term(ctx)}
			{:else if ctx.type === "timeout"}
				{@render timeout(ctx)}
			{:else if ctx.type === "unbanRequest"}
				{@render unbanRequest(ctx)}
			{:else if ctx.type === "untimeout"}
				{@html colorizeName(ctx.moderator)} removed timeout on {@html colorizeName(
					ctx.user,
				)}.
			{:else if ctx.type === "warn"}
				{@render warn(ctx)}
			{:else if ctx.type === "warnAck"}
				{@html colorizeName(ctx.user)} acknowledged their warning.
			{/if}
		{:else}
			{message.text}
		{/if}
	</p>
</div>

{#snippet autoMod(ctx: AutoModContext)}
	{@const target = colorizeName(ctx.user)}

	{#if ctx.status === "expired"}
		{@html target}'s message expired and was not shown in chat.
	{:else}
		{@html colorizeName(ctx.moderator)} {ctx.status} {@html target}'s message.
	{/if}
{/snippet}

{#snippet banStatus(ctx: BanStatusContext)}
	{@const target = colorizeName(ctx.user)}
	{@const action = ctx.banned ? "banned" : "unbanned"}

	{#if ctx.moderator}
		{@html colorizeName(ctx.moderator)} {action} {@html target}
	{:else}
		{@html target} has been {action}
	{/if}{ctx.reason ? `: ${ctx.reason}` : "."}
{/snippet}

{#snippet clear(ctx: ClearContext)}
	{#if ctx.moderator}
		{@html colorizeName(ctx.moderator)} cleared the chat
	{:else}
		The chat has been cleared
	{/if}

	for non-moderator viewers.
{/snippet}

{#snippet deleteMsg(ctx: DeleteContext)}
	{@const target = colorizeName(ctx.user)}

	{#if ctx.moderator}
		{@html colorizeName(ctx.moderator)} deleted {@html target}'s message: {ctx.text}
	{:else}
		{@html target}'s message was deleted: {ctx.text}
	{/if}
{/snippet}

{#snippet emoteSetUpdate(ctx: EmoteSetUpdateContext)}
	{@html colorizeName(ctx.actor)}

	{#if ctx.action === "renamed"}
		renamed <span class="text-foreground font-medium">{ctx.oldName}</span> to
		<span class="text-foreground font-medium">{ctx.emote.name}</span>
	{:else}
		{ctx.action} an emote:
		<span class="text-foreground font-medium">{ctx.emote.name}</span>
	{/if}

	<img
		class="-my-2 inline-block"
		src={ctx.emote.srcset.join(", ")}
		alt={ctx.emote.name}
		width={ctx.emote.width}
		height={ctx.emote.height}
		decoding="async"
	/>
{/snippet}

{#snippet mode(ctx: ModeContext)}
	{@html colorizeName(ctx.moderator)}
	{ctx.enabled ? "enabled" : "disabled"}
	{Number.isNaN(ctx.seconds) ? "" : formatDuration(ctx.seconds)}
	{ctx.mode === "slow" ? "slow mode." : `${ctx.mode} chat.`}
{/snippet}

{#snippet roleStatus(ctx: RoleStatusContext)}
	{@html colorizeName(ctx.broadcaster)}
	{ctx.added ? "added" : "removed"}
	{@html colorizeName(ctx.user)} as a {ctx.role}.
{/snippet}

{#snippet streamStatus(ctx: StreamStatusContext)}
	{@html colorizeName(ctx.broadcaster)} is now {ctx.online ? "online" : "offline"}.
{/snippet}

{#snippet suspicionStatus(ctx: SuspicionStatusContext)}
	{@html colorizeName(ctx.moderator)}
	{ctx.active ? "started" : "stopped"}
	{monitored ? "monitoring" : restricted ? "restricting" : ctx.previous}
	{@html colorizeName(ctx.user)}'s messages.
{/snippet}

{#snippet term(ctx: TermContext)}
	{@const via = ctx.data.from_automod ? " (via AutoMod)" : ""}

	{@html colorizeName(ctx.moderator)}
	{ctx.data.action === "add" ? "added" : "removed"}

	{#if ctx.data.terms.length === 1}
		a {ctx.data.list} term{via}: {ctx.data.terms[0]}
	{:else}
		{ctx.data.terms.length} {ctx.data.list} terms{via}: {ctx.data.terms.join(", ")}
	{/if}
{/snippet}

{#snippet timeout(ctx: TimeoutContext)}
	{@const target = colorizeName(ctx.user)}
	{@const duration = formatDuration(ctx.seconds)}

	{#if ctx.moderator}
		{@html colorizeName(ctx.moderator)} timed out {@html target} for {duration}
	{:else}
		{@html target} has been timed out for {duration}
	{/if}{ctx.reason ? `: ${ctx.reason}` : "."}
{/snippet}

{#snippet unbanRequest(ctx: UnbanRequestContext)}
	{@const target = colorizeName(ctx.user)}

	{#if "status" in ctx.request}
		{#if !ctx.moderator}
			{@html target}'s unban request was {ctx.request.status}.
		{:else}
			{@html colorizeName(ctx.moderator)}
			{ctx.request.status}
			{@html target}'s unban request{ctx.request.resolution_text
				? `: ${ctx.request.resolution_text}`
				: "."}
		{/if}
	{:else}
		{@html target} submitted an unban request: {ctx.request.text}
	{/if}
{/snippet}

{#snippet warn(ctx: WarnContext)}
	{@const reasons = [ctx.warning.reason, ...(ctx.warning.chat_rules_cited ?? [])]
		.filter((r) => r !== null)
		.join(", ")}

	{@html colorizeName(ctx.moderator)} warned {@html colorizeName(ctx.user)}: {reasons}
{/snippet}
