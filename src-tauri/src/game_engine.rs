use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Question {
    pub id: i64,
    pub question_text: String,
    pub question_type: String,
    pub correct_answer: String,
    pub options: Option<Vec<String>>,
    pub image_url: Option<String>,
    pub difficulty: String,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QuestionSet {
    pub id: i64,
    pub name: String,
    pub description: String,
}

/// Load all questions from database
pub fn get_all_questions(db_path: &Path) -> Result<Vec<Question>, rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    let mut stmt = conn.prepare(
        "SELECT id, question_text, question_type, correct_answer, options,
         image_url, difficulty, category FROM questions"
    )?;

    let questions = stmt.query_map([], |row| {
        let options_json: Option<String> = row.get(4)?;
        let options = options_json.and_then(|json| {
            serde_json::from_str::<Vec<String>>(&json).ok()
        });

        Ok(Question {
            id: row.get(0)?,
            question_text: row.get(1)?,
            question_type: row.get(2)?,
            correct_answer: row.get(3)?,
            options,
            image_url: row.get(5)?,
            difficulty: row.get(6)?,
            category: row.get(7)?,
        })
    })?
    .collect::<Result<Vec<_>, _>>()?;

    Ok(questions)
}

/// Load a specific question by ID
pub fn get_question_by_id(db_path: &Path, question_id: i64) -> Result<Question, rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    let mut stmt = conn.prepare(
        "SELECT id, question_text, question_type, correct_answer, options,
         image_url, difficulty, category FROM questions WHERE id = ?1"
    )?;

    let question = stmt.query_row([question_id], |row| {
        let options_json: Option<String> = row.get(4)?;
        let options = options_json.and_then(|json| {
            serde_json::from_str::<Vec<String>>(&json).ok()
        });

        Ok(Question {
            id: row.get(0)?,
            question_text: row.get(1)?,
            question_type: row.get(2)?,
            correct_answer: row.get(3)?,
            options,
            image_url: row.get(5)?,
            difficulty: row.get(6)?,
            category: row.get(7)?,
        })
    })?;

    Ok(question)
}

/// Create a new question
pub fn create_question(
    db_path: &Path,
    question_text: &str,
    question_type: &str,
    correct_answer: &str,
    options: Option<Vec<String>>,
    image_url: Option<&str>,
    difficulty: &str,
    category: &str,
) -> Result<i64, rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    let options_json = options.and_then(|opts| serde_json::to_string(&opts).ok());

    conn.execute(
        "INSERT INTO questions (question_text, question_type, correct_answer, options,
         image_url, difficulty, category) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        (
            question_text,
            question_type,
            correct_answer,
            options_json,
            image_url,
            difficulty,
            category,
        ),
    )?;

    Ok(conn.last_insert_rowid())
}

/// Get all question sets
pub fn get_all_question_sets(db_path: &Path) -> Result<Vec<QuestionSet>, rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    let mut stmt = conn.prepare("SELECT id, name, description FROM question_sets")?;

    let sets = stmt.query_map([], |row| {
        Ok(QuestionSet {
            id: row.get(0)?,
            name: row.get(1)?,
            description: row.get(2)?,
        })
    })?
    .collect::<Result<Vec<_>, _>>()?;

    Ok(sets)
}

/// Get questions in a specific set
pub fn get_questions_in_set(db_path: &Path, set_id: i64) -> Result<Vec<Question>, rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    let mut stmt = conn.prepare(
        "SELECT q.id, q.question_text, q.question_type, q.correct_answer, q.options,
         q.image_url, q.difficulty, q.category
         FROM questions q
         JOIN set_questions sq ON q.id = sq.question_id
         WHERE sq.set_id = ?1
         ORDER BY sq.position"
    )?;

    let questions = stmt.query_map([set_id], |row| {
        let options_json: Option<String> = row.get(4)?;
        let options = options_json.and_then(|json| {
            serde_json::from_str::<Vec<String>>(&json).ok()
        });

        Ok(Question {
            id: row.get(0)?,
            question_text: row.get(1)?,
            question_type: row.get(2)?,
            correct_answer: row.get(3)?,
            options,
            image_url: row.get(5)?,
            difficulty: row.get(6)?,
            category: row.get(7)?,
        })
    })?
    .collect::<Result<Vec<_>, _>>()?;

    Ok(questions)
}

/// Create a new question set
pub fn create_question_set(
    db_path: &Path,
    name: &str,
    description: &str,
) -> Result<i64, rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    conn.execute(
        "INSERT INTO question_sets (name, description) VALUES (?1, ?2)",
        (name, description),
    )?;

    Ok(conn.last_insert_rowid())
}

/// Add a question to a set
pub fn add_question_to_set(
    db_path: &Path,
    set_id: i64,
    question_id: i64,
    position: i32,
) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    conn.execute(
        "INSERT INTO set_questions (set_id, question_id, position) VALUES (?1, ?2, ?3)",
        (set_id, question_id, position),
    )?;

    Ok(())
}

/// Remove a question from a set
pub fn remove_question_from_set(
    db_path: &Path,
    set_id: i64,
    question_id: i64,
) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    conn.execute(
        "DELETE FROM set_questions WHERE set_id = ?1 AND question_id = ?2",
        (set_id, question_id),
    )?;

    Ok(())
}

/// Update a question set
pub fn update_question_set(
    db_path: &Path,
    set_id: i64,
    name: &str,
    description: &str,
) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    conn.execute(
        "UPDATE question_sets SET name = ?1, description = ?2 WHERE id = ?3",
        (name, description, set_id),
    )?;

    Ok(())
}

/// Delete a question set
pub fn delete_question_set(db_path: &Path, set_id: i64) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    // Delete from set_questions first (foreign key constraint)
    conn.execute(
        "DELETE FROM set_questions WHERE set_id = ?1",
        [set_id],
    )?;

    // Delete the set itself
    conn.execute(
        "DELETE FROM question_sets WHERE id = ?1",
        [set_id],
    )?;

    Ok(())
}

/// Delete a question
pub fn delete_question(db_path: &Path, question_id: i64) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(db_path)?;

    // Delete from set_questions first
    conn.execute(
        "DELETE FROM set_questions WHERE question_id = ?1",
        [question_id],
    )?;

    // Delete the question itself
    conn.execute(
        "DELETE FROM questions WHERE id = ?1",
        [question_id],
    )?;

    Ok(())
}

/// Calculate points for an answer
pub fn calculate_points(is_correct: bool, time_elapsed: u32, time_limit: u32) -> u32 {
    if !is_correct {
        return 0;
    }

    // Base points for correct answer
    let base_points = 100;

    // Speed bonus: up to 100 additional points
    // Faster answers get more bonus points
    let time_percentage = (time_elapsed as f32 / time_limit as f32).min(1.0);
    let speed_bonus = ((1.0 - time_percentage) * 100.0) as u32;

    base_points + speed_bonus
}

/// Check if an answer is correct
pub fn check_answer(question: &Question, player_answer: &str) -> bool {
    // Trim and compare case-insensitively
    let correct = question.correct_answer.trim().to_lowercase();
    let answer = player_answer.trim().to_lowercase();

    match question.question_type.as_str() {
        "multiple_choice" | "true_false" => {
            // Exact match required
            answer == correct
        }
        "text_input" => {
            // Allow some flexibility for text answers
            answer == correct || answer.contains(&correct) || correct.contains(&answer)
        }
        "first_letter" => {
            // Check if the player's answer matches the first letter(s) of the correct answer
            // Accept both single letter and full answer
            if answer.len() == 1 {
                // Single letter answer
                correct.chars().next().map(|c| c.to_string()) == Some(answer)
            } else {
                // Full answer also accepted
                answer == correct
            }
        }
        _ => answer == correct,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_points() {
        // Perfect answer (instant)
        assert_eq!(calculate_points(true, 0, 30), 200);

        // Half time elapsed
        assert_eq!(calculate_points(true, 15, 30), 150);

        // All time elapsed
        assert_eq!(calculate_points(true, 30, 30), 100);

        // Incorrect answer
        assert_eq!(calculate_points(false, 0, 30), 0);
    }

    #[test]
    fn test_check_answer() {
        let question = Question {
            id: 1,
            question_text: "What is 2+2?".to_string(),
            question_type: "text_input".to_string(),
            correct_answer: "4".to_string(),
            options: None,
            image_url: None,
            difficulty: "easy".to_string(),
            category: "Math".to_string(),
        };

        assert!(check_answer(&question, "4"));
        assert!(check_answer(&question, " 4 "));
        assert!(!check_answer(&question, "5"));
    }
}
