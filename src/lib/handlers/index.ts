/* eslint-disable perfectionist/sort-imports */

import type { Handler } from "./helper";
//
import join from "./irc/join";
import clearmsg from "./irc/clearmsg";
import privmsg from "./irc/privmsg";
import usernotice from "./irc/usernotice";
import part from "./irc/part";
//
import channelModerate from "./eventsub/channel-moderate";

export const handlers = new Map<string, Handler>();

function register(handler: Handler<any>) {
	handlers.set(handler.name, handler);
}

register(join);
register(clearmsg);
register(privmsg);
register(usernotice);
register(part);

register(channelModerate);
