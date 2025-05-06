/* eslint-disable perfectionist/sort-imports */

import type { Handler } from "./helper";
//
import join from "./irc/join";
import clearchat from "./irc/clearchat";
import clearmsg from "./irc/clearmsg";
import privmsg from "./irc/privmsg";
import usernotice from "./irc/usernotice";
import notice from "./irc/notice";
import part from "./irc/part";
//
import channelModerate from "./eventsub/channel-moderate";
import streamOnline from "./eventsub/stream-online";
import streamOffline from "./eventsub/stream-offline";

export const handlers = new Map<string, Handler>();

function register(handler: Handler<any>) {
	handlers.set(handler.name, handler);
}

register(join);
register(clearchat);
register(clearmsg);
register(privmsg);
register(usernotice);
register(notice);
register(part);

register(channelModerate);
register(streamOnline);
register(streamOffline);
