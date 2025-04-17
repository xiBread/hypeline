import antfu from "@antfu/eslint-config";

export default antfu({
	stylistic: false,
	svelte: true,
	rules: {
		"no-console": "off",
		"no-control-regex": "off",
		"no-unused-vars": "off",
		"import/order": "off",
		"perfectionist/sort-imports": [
			"error",
			{
				newlinesBetween: "never",
				groups: [
					"side-effect",
					"side-effect-style",
					"builtin",
					"external",
					"sveltekit",
					["internal", "internal-type"],
					["parent", "parent-type"],
					["sibling", "sibling-type"],
					["index", "index-type"],
					"object",
					"unknown",
				],
				customGroups: {
					value: {
						sveltekit: ["\\$app/.+", "\\$env/.+", "\\$lib/.+"],
					},
				},
			},
		],
		"unused-imports/no-unused-imports": "off",
		"unused-imports/no-unused-vars": "off",
		"svelte/no-at-html-tags": "off",
	},
});
