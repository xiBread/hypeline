import type { IrcMessageMap } from "$lib/twitch/irc";
import clearmsg from "./clearmsg";
import type { Handler } from "./helper";
import privmsg from "./privmsg";
import usernotice from "./usernotice";

export const handlers = new Map<string, Handler<keyof IrcMessageMap>>();

function register(handler: Handler<any>) {
	handlers.set(handler.name, handler);
}

register(clearmsg);
register(privmsg);
register(usernotice);
