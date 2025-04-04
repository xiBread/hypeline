interface AppState {
	wsSessionId?: string;
}

export const appState = $state<AppState>({});
