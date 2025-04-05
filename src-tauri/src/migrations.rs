use tauri_plugin_sql::{Migration, MigrationKind};

pub fn emotes() -> Vec<Migration> {
    vec![Migration {
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
    }]
}
