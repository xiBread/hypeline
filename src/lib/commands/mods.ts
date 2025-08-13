/* eslint-disable unicorn/error-message */

import { SystemMessage } from "$lib/message";
import { defineCommand } from "./util";

type GqlResponse =
	| {
			data: {
				user: {
					mods: {
						edges: {
							node: {
								id: string;
								displayName: string;
							};
						}[];
					};
				};
			};
			errors?: never;
	  }
	| {
			data?: never;
			errors: [];
	  };

export default defineCommand({
	name: "mods",
	description: "Display a list of moderators for this channel",
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
						mods(first: 100) {
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

		if (!response.ok) throw new Error();

		const body: GqlResponse = await response.json();
		const moderators: string[] = [];

		if (body.errors) throw new Error();

		for (const { node } of body.data.user.mods.edges) {
			const user = channel.viewers.get(node.id);
			moderators.push(user?.displayName ?? node.displayName);
		}

		const message = new SystemMessage();
		message.setText(
			`Channel moderators (${moderators.length}): ${moderators.sort().join(", ")}`,
		);

		channel.addMessage(message);
	},
});
