export * from "./chat";
export * from "./event-sub";
export * from "./users";

export interface WebSocketMessage<T = Record<string, any>> {
	metadata: WebSocketMessageMetadata;
	payload: T;
}

export interface WebSocketMessageMetadata {
	message_id: string;
	message_type: string;
	message_timestamp: string;
}

export type WelcomeMessage = WebSocketMessage<{
	session: {
		id: string;
		status: string;
		keepalive_timeout_seconds: number;
		reconnect_url: string;
		connected_at: string;
	};
}>;
