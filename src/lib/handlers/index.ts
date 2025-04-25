import clearmsg from "./clearmsg";
import type { Handler } from "./helper";
import privmsg from "./privmsg";
import usernotice from "./usernotice";

export const handlers = new Map<string, Handler<any>>();

function register(handler: Handler<any>) {
	handlers.set(handler.name, handler);
}

register(clearmsg);
register(privmsg);
register(usernotice);
