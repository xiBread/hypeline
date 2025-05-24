<script lang="ts">
	import { Popover, Toggle } from "bits-ui";
	import { settings } from "$lib/settings";
	import type { CustomHighlightTypeSettings } from "$lib/settings";
	import ColorPicker from "../../ui/ColorPicker.svelte";
	import Input from "../../ui/Input.svelte";
	import * as Select from "../../ui/select";
	import { styles } from ".";

	const defaultCustom: CustomHighlightTypeSettings = {
		enabled: true,
		pattern: "",
		style: "default",
		color: "#ff0000",
		regex: false,
		wholeWord: false,
		matchCase: false,
	};
</script>

<div>
	<h2 class="mb-2">Custom</h2>

	<div>
		<button
			class="bg-twitch mb-4 flex items-center rounded-md px-4 py-2 text-sm font-medium"
			type="button"
			onclick={() => settings.state.highlights.custom.push(defaultCustom)}
		>
			<span class="lucide--plus iconify mr-1 size-4"></span>
			Add new trigger
		</button>

		<div class="overflow-x-auto">
			<div class="grid min-w-max grid-cols-[repeat(7,auto)] gap-x-3 gap-y-4">
				{#each settings.state.highlights.custom as highlight, i}
					<Input
						class="col-start-1 focus-visible:ring-0"
						type="text"
						bind:value={highlight.pattern}
					/>

					<Toggle.Root
						class={[
							"border-input flex size-9 items-center justify-center justify-self-center rounded-md border bg-transparent",
							"dark:hover:bg-input/50 dark:bg-input/30  data-[state=on]:dark:bg-input",
						]}
						title="Match as regular expression"
						aria-label="Match as regular expression"
						bind:pressed={highlight.regex}
					>
						<span class="iconify lucide--regex"></span>
					</Toggle.Root>

					<Toggle.Root
						class={[
							"border-input flex size-9 items-center justify-center justify-self-center rounded-md border bg-transparent",
							"data-[state=on]:dark:bg-input dark:hover:bg-input/50 dark:bg-input/30 ",
						]}
						title="Match whole word"
						aria-label="Match whole word"
						bind:pressed={highlight.wholeWord}
					>
						<span class="iconify lucide--whole-word"></span>
					</Toggle.Root>

					<Toggle.Root
						class={[
							"border-input flex size-9 items-center justify-center justify-self-center rounded-md border bg-transparent",
							"data-[state=on]:dark:bg-input dark:hover:bg-input/50 dark:bg-input/30",
						]}
						title="Match case"
						aria-label="Match case"
						bind:pressed={highlight.matchCase}
					>
						<span class="iconify lucide--case-sensitive"></span>
					</Toggle.Root>

					<Popover.Root>
						<Popover.Trigger
							class="border-input size-9 shrink-0 justify-self-center rounded-md border bg-(--highlight)"
							--highlight={highlight.color}
						/>

						<Popover.Content class="w-60" sideOffset={10}>
							<ColorPicker
								class="bg-background rounded-md border p-3"
								bind:value={highlight.color}
							/>
						</Popover.Content>
					</Popover.Root>

					<Select.Root
						type="single"
						bind:value={
							() => (highlight.enabled ? highlight.style : "disabled"),
							(value) => {
								if (value === "disabled") {
									highlight.enabled = false;
								} else {
									highlight.enabled = true;
									highlight.style = value;
								}
							}
						}
					>
						<Select.Trigger class="w-full min-w-36">
							{highlight.enabled
								? styles.find((h) => h.value === highlight.style)!.label
								: "Disabled"}
						</Select.Trigger>

						<Select.Content>
							{#each styles as style}
								<Select.Item class="hover:cursor-pointer" value={style.value}>
									{style.label}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>

					<button
						class="dark:hover:bg-input/50 dark:bg-input/30 border-input flex size-9 items-center justify-center rounded-md border bg-transparent"
						title="Delete"
						type="button"
						aria-label="Delete trigger"
						onclick={() => settings.state.highlights.custom.splice(i, 1)}
					>
						<span class="iconify lucide--trash"></span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>
