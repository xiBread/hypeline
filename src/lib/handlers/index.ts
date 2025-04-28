/* eslint-disable perfectionist/sort-imports */

import type { IrcMessageMap } from "$lib/twitch/irc";
import type { Handler } from "./helper";
//
import clearmsg from "./clearmsg";
import privmsg from "./privmsg";
import usernotice from "./usernotice";
import part from "./part";

export const handlers = new Map<string, Handler<keyof IrcMessageMap>>();

function register(handler: Handler<any>) {
	handlers.set(handler.name, handler);
}

register(clearmsg);
register(privmsg);
register(usernotice);
register(part);
