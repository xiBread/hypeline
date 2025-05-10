<script lang="ts">
	import { Slider } from "bits-ui";
	import Color from "color";
	import type { ColorLike } from "color";
	import type { HTMLAttributes } from "svelte/elements";
	import { clamp, cn } from "$lib/util";
	import Input from "./Input.svelte";

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: ColorLike;
	}

	let { class: className, value = $bindable(), ...rest }: Props = $props();

	const color = $state(Color(value));

	let h = $state(color.hue() || 0);
	let s = $state(color.saturationv() || 100);
	let v = $state(color.value() || 50);

	let well = $state<HTMLElement>();
	let isDragging = $state(false);

	const position = $derived({ x: s, y: 100 - v });
	const hex = $derived(Color.hsv(h, s, v).hex());

	$effect(() => {
		value = hex;
	});

	$effect(() => {
		if (isDragging) {
			addEventListener("pointermove", handlePointerMove);
			addEventListener("pointerup", () => (isDragging = false));
		}

		return () => {
			removeEventListener("pointermove", handlePointerMove);
			removeEventListener("pointerup", () => (isDragging = false));
		};
	});

	function handlePointerMove(event: PointerEvent) {
		if (!isDragging || !well) return;

		const rect = well.getBoundingClientRect();

		const x = clamp(0, event.clientX - rect.left, rect.width);
		const y = clamp(0, event.clientY - rect.top, rect.height);

		s = clamp(0, x / rect.width, 1) * 100;
		v = clamp(0, (rect.height - y) / rect.height, 1) * 100;
	}

	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		try {
			const newColor = Color(event.currentTarget.value);

			h = newColor.hue();
			s = newColor.saturationv();
			v = newColor.value();
		} catch {}
	}
</script>

<div class={cn("grid w-full gap-4", className)} {...rest}>
	<div
		id="color-picker-well"
		class="border-muted relative aspect-[4/3] w-full cursor-crosshair rounded-md border"
		style:--color-picker-well-hue={h}
		onpointerdown={(event) => {
			event.preventDefault();

			isDragging = true;
			handlePointerMove(event);
		}}
		bind:this={well}
	>
		<div
			class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
			style:top="{position.y}%"
			style:left="{position.x}%"
			style:box-shadow="0 0 0 1px rgb(0 0 0 / 50%)"
		></div>
	</div>

	<Slider.Root
		class="relative flex h-4 w-full touch-none"
		type="single"
		value={h}
		step={1}
		max={360}
		onValueChange={(value) => (h = value)}
	>
		<div
			id="color-picker-hue"
			class="relative my-0.5 h-3 w-full grow rounded-full"
		>
			<Slider.Range class="absolute w-full" />
		</div>

		<Slider.Thumb
			class="border-primary/50 bg-background focus-visible:ring-ring block h-4 w-4 rounded-full border shadow transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			index={0}
		/>
	</Slider.Root>

	<Input
		class="text-xs shadow-none"
		type="text"
		value={hex}
		onchange={handleChange}
	/>
</div>

<style>
	#color-picker-well {
		background:
			linear-gradient(0deg, rgb(0, 0, 0), transparent),
			linear-gradient(
				90deg,
				rgb(255, 255, 255),
				hsl(var(--color-picker-well-hue), 100%, 50%)
			);
	}

	#color-picker-hue {
		background: linear-gradient(
			90deg,
			#ff0000,
			#ffff00,
			#00ff00,
			#00ffff,
			#0000ff,
			#ff00ff,
			#ff0000
		);
	}
</style>
