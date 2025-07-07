<script lang="ts">
	import dayjs from "dayjs";
	import { settings } from "$lib/settings";

	const { date }: { date: Date } = $props();

	const timestamps = $derived(settings.state.appearance.timestamps);

	const format = $derived.by(() => {
		let format = timestamps.format;

		if (format === "custom") {
			if (timestamps.customFormat) {
				return timestamps.customFormat;
			}

			format = "auto";
		}

		if (format === "auto") {
			const locale = new Intl.Locale(navigator.language);
			// @ts-expect-error - limited support
			const cycles: string[] = locale.getHourCycles?.() ?? [];
			format = cycles.includes("h12") ? "12" : "24";
		}

		return format === "12" ? "h:mm A" : "HH:mm";
	});

	const formatted = $derived(dayjs(date).format(format));
</script>

{#if timestamps.show}
	<time class="text-muted-foreground text-xs tabular-nums" datetime={date.toISOString()}>
		{formatted}
	</time>
{/if}
