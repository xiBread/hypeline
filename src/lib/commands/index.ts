import announce from "./announce";
import ban from "./ban";
import block from "./block";
import clear from "./clear";
import emoteOnly from "./emote-only";
import followerOnly from "./follower-only";
import marker from "./marker";
import mod from "./mod";
import mods from "./mods";
import raid from "./raid";
// import sharedChat from "./shared-chat";
import shield from "./shield";
import shoutout from "./shoutout";
import slow from "./slow";
import subscriberOnly from "./subscriber-only";
import timeout from "./timeout";
import unban from "./unban";
import unblock from "./unblock";
import unique from "./unique";
import unmod from "./unmod";
import unraid from "./unraid";
import untimeout from "./untimeout";
import unvip from "./unvip";
// import user from "./user";
import vip from "./vip";
import vips from "./vips";
import warn from "./warn";

export const commands = [
	announce,
	ban,
	block,
	clear,
	emoteOnly,
	followerOnly,
	marker,
	mod,
	mods,
	raid,
	// sharedChat,
	shield,
	shoutout,
	slow,
	subscriberOnly,
	timeout,
	unban,
	unblock,
	unique,
	unmod,
	unraid,
	untimeout,
	unvip,
	// user,
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
