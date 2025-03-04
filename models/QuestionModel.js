// models/QuestionModel.js
const db = require('../models/database');

class QuestionModel {
    static create({ questions }) {
        const insertStmt = db.prepare(
            "INSERT INTO questions (subject, question_image, question_text, options, answer, year) VALUES (?, ?, ?, ?, ?, ?)"
        );
        // Create a transaction for batch inserting.
        const insertTransaction = db.transaction((questions) => {
            for (const q of questions) {
                // Convert options array to JSON string for storage
                insertStmt.run(subject, question_image, question_text, JSON.stringify(options), answer, year);
            }
        });

        insertTransaction(questions);
    }

    static find(subject, year) {
        const stmt = db.prepare(`SELECT * FROM questions WHERE subject = ? AND year = ? ORDER BY RANDOM() LIMIT 50;`);
        const questions = stmt.all(subject, year);
        console.log(questions)

        if (questions.length !== 0) {
            questions.forEach(q => {
                if (q.options) {
                    q.options = JSON.parse(q.options);
                }
            });
        }
        return questions;
    }

    static findAll() {
        const stmt = db.prepare("SELECT * FROM questions");
        return stmt.all().map(row => {
            row.options = JSON.parse(row.options);
            return row;
        });
    }

    static count() {
        const stmt = db.prepare("SELECT COUNT(*) as count FROM questions");
        return stmt.get().count;
    }
}

module.exports = QuestionModel;
