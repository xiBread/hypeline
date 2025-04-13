export type WebSocketMessageType =
	| "session_welcome"
	| "session_keepalive"
	| "session_reconnect"
	| "notification"
	| "revocation";

export interface MessageMetadata {
	message_type: WebSocketMessageType;
}

export interface WebSocketMessage {
	metadata: MessageMetadata;
	payload: Record<string, any>;
}

export interface SessionWelcome {
	session: { id: string };
}

export interface Notification {
	subscription: { type: string };
	event: Record<string, any>;
}
