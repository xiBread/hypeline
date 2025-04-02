<script lang="ts">
	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { getUsers } from "$lib/twitch-api";
	import { PUBLIC_TWITCH_CLIENT_ID } from "$env/static/public";
	import { goto } from "$app/navigation";

	onMount(async () => {
		const [accessToken] = location.hash.slice(1).split("=")[1].split("&");
		// TODO: validate state

		const response = await fetch("https://api.twitch.tv/helix/users", {
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"Client-Id": PUBLIC_TWITCH_CLIENT_ID,
			},
		});

		const { data } = await response.json();
		const [user] = getUsers.parse(data);

		const userExists = await page.data.settings.has("user");

		if (!userExists) {
			await page.data.settings.set("user", { ...user, accessToken });
			await page.data.settings.save();
		}

		await goto("/");
	});
</script>
