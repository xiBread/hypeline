interface AppState {
	loading: boolean;
	wsSessionId?: string;
}

export const appState = $state<AppState>({
	loading: true,
});
