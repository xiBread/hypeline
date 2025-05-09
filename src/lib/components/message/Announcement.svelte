<script lang="ts">
	import type { UserMessage } from "$lib/message";
	import { app } from "$lib/state.svelte";
	import Message from "./Message.svelte";

	interface Props {
		message: UserMessage;
		color: string;
	}

	const colors: Record<string, string[]> = {
		PRIMARY: [app.active.user.color, app.active.user.color],
		BLUE: ["#00d6d6", "#9146ff"],
		GREEN: ["#00db84", "#57bee6"],
		ORANGE: ["#ffb31a", "#e0e000"],
		PURPLE: ["#9146ff", "#ff75e6"],
	};

	const { message, color }: Props = $props();
	const stops = colors[color];
</script>

<div
	class="my-1 border-x-6 [border-image-slice:1]"
	style:border-image-source="linear-gradient({stops[0]}, {stops[1]})"
>
	<div class="bg-muted flex items-center px-2.5 py-1.5 text-xs font-medium">
		<span class="iconify lucide--megaphone mr-2 size-4"></span> Announcement
	</div>

	<div class="bg-muted/50 p-1.5">
		<Message {message} />
	</div>
</div>
