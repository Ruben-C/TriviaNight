use rusqlite::{Connection, Result};
use std::path::Path;

pub fn init_database(db_path: &Path) -> Result<()> {
    let conn = Connection::open(db_path)?;

    // Create questions table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT NOT NULL,
            question_type TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            options TEXT,
            image_url TEXT,
            difficulty TEXT,
            category TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create question sets table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS question_sets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )",
        [],
    )?;

    // Create junction table for questions in sets
    conn.execute(
        "CREATE TABLE IF NOT EXISTS set_questions (
            set_id INTEGER,
            question_id INTEGER,
            position INTEGER,
            FOREIGN KEY(set_id) REFERENCES question_sets(id) ON DELETE CASCADE,
            FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE,
            PRIMARY KEY(set_id, question_id)
        )",
        [],
    )?;

    // Create games table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            set_id INTEGER,
            game_code TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL,
            started_at DATETIME,
            ended_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(set_id) REFERENCES question_sets(id)
        )",
        [],
    )?;

    // Create players table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER,
            name TEXT NOT NULL,
            score INTEGER DEFAULT 0,
            joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Create answers table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            game_id INTEGER,
            player_id INTEGER,
            question_id INTEGER,
            answer TEXT NOT NULL,
            is_correct BOOLEAN,
            points_earned INTEGER,
            answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(game_id) REFERENCES games(id) ON DELETE CASCADE,
            FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE,
            FOREIGN KEY(question_id) REFERENCES questions(id)
        )",
        [],
    )?;

    // Insert some sample questions for testing
    insert_sample_questions(&conn)?;

    Ok(())
}

fn insert_sample_questions(conn: &Connection) -> Result<()> {
    // Check if questions already exist
    let count: i64 = conn.query_row("SELECT COUNT(*) FROM questions", [], |row| row.get(0))?;

    if count == 0 {
        // Insert sample multiple choice questions
        conn.execute(
            "INSERT INTO questions (question_text, question_type, correct_answer, options, difficulty, category)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            [
                "What is the capital of France?",
                "multiple_choice",
                "Paris",
                r#"["Paris", "London", "Berlin", "Madrid"]"#,
                "easy",
                "Geography"
            ],
        )?;

        conn.execute(
            "INSERT INTO questions (question_text, question_type, correct_answer, options, difficulty, category)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            [
                "Which planet is known as the Red Planet?",
                "multiple_choice",
                "Mars",
                r#"["Venus", "Mars", "Jupiter", "Saturn"]"#,
                "easy",
                "Science"
            ],
        )?;

        conn.execute(
            "INSERT INTO questions (question_text, question_type, correct_answer, options, difficulty, category)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            [
                "Who painted the Mona Lisa?",
                "multiple_choice",
                "Leonardo da Vinci",
                r#"["Michelangelo", "Leonardo da Vinci", "Raphael", "Donatello"]"#,
                "medium",
                "Art"
            ],
        )?;

        // Insert sample text input questions
        conn.execute(
            "INSERT INTO questions (question_text, question_type, correct_answer, difficulty, category)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            [
                "What year did World War II end?",
                "text_input",
                "1945",
                "medium",
                "History"
            ],
        )?;

        println!("Sample questions inserted successfully");
    }

    Ok(())
}
