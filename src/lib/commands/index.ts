import announce from "./announce";
import ban from "./ban";
import block from "./block";
import clear from "./clear";
import color from "./color";
import emoteOnly from "./emote-only";
import followerOnly from "./follower-only";
import marker from "./marker";
import mod from "./mod";
import mods from "./mods";
import monitor from "./monitor";
import pin from "./pin";
import raid from "./raid";
import restrict from "./restrict";
import sharedChat from "./shared-chat";
import shield from "./shield";
import shoutout from "./shoutout";
import slow from "./slow";
import subscriberOnly from "./subscriber-only";
import timeout from "./timeout";
import unban from "./unban";
import unique from "./unique";
import unmod from "./unmod";
import unmonitor from "./unmonitor";
import unraid from "./unraid";
import unrestrict from "./unrestrict";
import untimeout from "./untimeout";
import unvip from "./unvip";
import user from "./user";
import vip from "./vip";
import vips from "./vips";
import warn from "./warn";

export const commands = [
	announce,
	ban,
	block,
	clear,
	color,
	emoteOnly,
	followerOnly,
	marker,
	mod,
	mods,
	monitor,
	pin,
	raid,
	restrict,
	sharedChat,
	shield,
	shoutout,
	slow,
	subscriberOnly,
	timeout,
	unban,
	unique,
	unmod,
	unmonitor,
	unraid,
	unrestrict,
	untimeout,
	unvip,
	user,
	vip,
	vips,
	warn,
	{
		name: "me",
		description: "Express an action in the third person",
		args: [
			{
				name: "message",
				required: true,
			},
		],
		async exec() {
			// no-op since /me is the only command that Twitch allows to be sent
		},
	},
];
