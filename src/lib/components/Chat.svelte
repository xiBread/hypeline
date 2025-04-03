<script lang="ts">
	interface Props {
		class?: string;
		messages: string[];
	}

	const { class: className, messages }: Props = $props();
</script>

<div class={className}>
	{#each messages as message}
		<div>
			{message}
		</div>
	{/each}
</div>
