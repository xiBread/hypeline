<script lang="ts">
	import dayjs from "dayjs";
	import { settings } from "$lib/settings";

	const { date }: { date: Date } = $props();

	const format = $derived.by(() => {
		let format = settings.state.timestamps.format;

		if (format === "custom") {
			if (settings.state.timestamps.customFormat) {
				return settings.state.timestamps.customFormat;
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

<time class="text-muted-foreground text-xs" datetime={date.toISOString()}>
	{formatted}
</time>
