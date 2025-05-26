/* eslint-disable regexp/no-super-linear-backtracking */

import { invoke } from "@tauri-apps/api/core";

// https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/log/guest-js/index.ts#L47-L111
function getCallerLocation(stack?: string) {
	if (!stack) return;

	if (stack.startsWith("Error")) {
		const lines = stack.split("\n");

		const callerLine = lines[3]?.trim();
		if (!callerLine) return;

		const regex =
			/at\s+(?<functionName>.*?)\s+\((?<fileName>.*?):(?<lineNumber>\d+):(?<columnNumber>\d+)\)/;
		const match = callerLine.match(regex);

		if (match) {
			const { functionName, fileName, lineNumber, columnNumber } = match.groups as {
				functionName: string;
				fileName: string;
				lineNumber: string;
				columnNumber: string;
			};

			return `${functionName}@${fileName}:${lineNumber}:${columnNumber}`;
		}

		const regexNoFunction = /at\s+(?<fileName>.*?):(?<lineNumber>\d+):(?<columnNumber>\d+)/;
		const matchNoFunction = callerLine.match(regexNoFunction);

		if (matchNoFunction) {
			const { fileName, lineNumber, columnNumber } = matchNoFunction.groups as {
				fileName: string;
				lineNumber: string;
				columnNumber: string;
			};

			return `<anonymous>@${fileName}:${lineNumber}:${columnNumber}`;
		}
	}

	const traces = stack.split("\n").map((line) => line.split("@"));
	const filtered = traces.filter(([name, location]) => {
		return name.length > 0 && location !== "[native code]";
	});

	return filtered[2]?.filter((v) => v.length > 0).join("@");
}

async function log(level: string, message: string) {
	// eslint-disable-next-line unicorn/error-message
	const location = getCallerLocation(new Error().stack);

	await invoke("log", { level, message, location });
}

export async function trace(message: string) {
	await log("trace", message);
}

export async function debug(message: string) {
	await log("debug", message);
}

export async function info(message: string) {
	await log("info", message);
}

export async function warn(message: string) {
	await log("warn", message);
}

export async function error(message: string) {
	await log("error", message);
}
