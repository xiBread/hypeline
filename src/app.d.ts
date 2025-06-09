declare global {
	namespace App {
		interface PageData {
			detached?: boolean;
		}
	}

	interface RegExpConstructor {
		// eslint-disable-next-line ts/method-signature-style
		escape(string: string): string;
	}
}

export {};
