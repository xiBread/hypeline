import { SystemMessage } from "$lib/message";
import { defineCommand } from "./util";

interface GqlResponse {
	user: {
		vips: {
			edges: {
				node: {
					id: string;
					displayName: string;
				};
			}[];
		};
	};
}

export default defineCommand({
	name: "vips",
	description: "Display a list of VIPs for this channel",
	async exec(_, channel) {
		const response = await fetch("https://gql.twitch.tv/gql", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
			},
			body: JSON.stringify({
				query: `query {
					user(login: "${channel.user.username}") {
						vips(first: 100) {
							edges {
								node {
									id
									displayName
								}
							}
						}
					}
				}`,
			}),
		});

		if (!response.ok) {
			channel.error = "An unknown error occurred while fetching VIPs.";
			return;
		}

		const body: { data: GqlResponse } = await response.json();
		const vips: string[] = [];

		for (const { node } of body.data.user.vips.edges) {
			const user = channel.viewers.get(node.id);
			vips.push(user?.displayName ?? node.displayName);
		}

		const message = new SystemMessage();
		message.setText(`Channel VIPs (${vips.length}): ${vips.sort().join(", ")}`);

		channel.addMessage(message);
	},
});
