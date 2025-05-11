<script lang="ts">
	import { Label, RadioGroup } from "bits-ui";
	import { setMode, userPrefersMode } from "mode-watcher";

	const themes = [
		{ value: "light", class: "bg-white" },
		{ value: "dark", class: "bg-neutral-950" },
		{ value: "system", class: "" },
	];
</script>

<div>
	<h2 class="mb-2">Theme</h2>

	<RadioGroup.Root
		class="flex items-center gap-6"
		bind:value={() => userPrefersMode.current, (value) => setMode(value)}
	>
		{#each themes as theme (theme.value)}
			<Label.Root class="flex flex-col items-center gap-2">
				<RadioGroup.Item
					class={[
						"flex size-16 items-center justify-center rounded-full border border-neutral-500",
						theme.class,
						userPrefersMode.current === theme.value && "border-twitch border-2",
					]}
					value={theme.value}
				>
					{#if theme.value === "system"}
						<span class="text-muted-foreground lucide--refresh-cw iconify size-6"
						></span>
					{/if}
				</RadioGroup.Item>

				<span class="text-sm font-medium capitalize">
					{theme.value}
				</span>
			</Label.Root>
		{/each}
	</RadioGroup.Root>
</div>
