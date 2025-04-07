use tauri_plugin_sql::{Migration, MigrationKind};

pub fn migrations() -> Vec<Migration> {
    vec![
        Migration {
            version: 1,
            description: "Create emotes table",
            kind: MigrationKind::Up,
            sql: r"
				CREATE TABLE IF NOT EXISTS emotes (
					id TEXT NOT NULL,
					name TEXT NOT NULL,
					url TEXT,
					width INTEGER,
					height INTEGER,
					username TEXT NOT NULL,
					user_id TEXT NOT NULL,
					PRIMARY KEY (id, username)
				)
			",
        },
        Migration {
            version: 2,
            description: "Create users table",
            kind: MigrationKind::Up,
            sql: r"
				CREATE TABLE IF NOT EXISTS users (
					id TEXT NOT NULL PRIMARY KEY,
					login TEXT NOT NULL,
					name TEXT NOT NULL,
					description TEXT,
					profile_image_url TEXT NOT NULL,
					type TEXT NOT NULL,
					broadcaster_type TEXT NOT NULL,
					created_at TEXT NOT NULL
				)
			",
        },
    ]
}
