/* eslint-disable perfectionist/sort-imports */

import type { Handler } from "./helper";
//
import clearchat from "./irc/clearchat";
import clearmsg from "./irc/clearmsg";
import join from "./irc/join";
import notice from "./irc/notice";
import part from "./irc/part";
import privmsg from "./irc/privmsg";
import usernotice from "./irc/usernotice";
//
import channelModerate from "./eventsub/channel-moderate";
import channelSubscriptionEnd from "./eventsub/channel-subscription-end";
import channelWarningAcknowledge from "./eventsub/channel-warning-acknowledge";
import streamOnline from "./eventsub/stream-online";
import streamOffline from "./eventsub/stream-offline";

export const handlers = new Map<string, Handler>();

function register(handler: Handler<any>) {
	handlers.set(handler.name, handler);
}

register(clearchat);
register(clearmsg);
register(join);
register(notice);
register(part);
register(privmsg);
register(usernotice);

register(channelModerate);
register(channelSubscriptionEnd);
register(channelWarningAcknowledge);
register(streamOnline);
register(streamOffline);
