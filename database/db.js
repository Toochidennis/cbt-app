const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Define the path to your SQLite database file.
const dbPath = path.join(__dirname, 'data', 'questions.db');

// Create dir if not exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Open or create database file
const db = new Database(dbPath);

// Create table if not exist
const query = `
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT,
        question TEXT,
        options TEXT,
        answer INTEGER,
        year INTEGER
    );
`;

db.exec(query);

function seedDatabaseFromFolder() {
    // Load data if the questions table is empty
    const rowCount = db.prepare("SELECT COUNT(*) as count FROM questions").get().count;
    if (rowCount === 0) {
        console.log("Seeding database with questions from folder...");
        const questionsFolder = path.join(__dirname, 'questions');

        // Check if the folder exists.
        if (!fs.existsSync(questionsFolder)) {
            console.error(`Questions folder not found at ${questionsFolder}`);
            return;
        }

        // Read all files in the questions folder and filter for .json files.
        const files = fs.readdirSync(questionsFolder).filter(file => path.extname(file) === '.json');

        // Prepare an insert statement.
        const insertStmt = db.prepare(
            "INSERT INTO questions (subject, question, options, answer, year) VALUES (?, ?, ?, ?, ?)"
        );

        // Create a transaction for batch inserting.
        const insertTransaction = db.transaction((questions) => {
            for (const q of questions) {
                // Convert the options array to a JSON string.
                const optionsStr = JSON.stringify(q.options);
                insertStmt.run(q.subject, q.question, optionsStr, q.answer, q.year);
            }
        });

        // Loop through each file, read its content, and insert questions.
        for (const file of files) {
            try {
                const filePath = path.join(questionsFolder, file);
                const fileContent = fs.readFileSync(filePath, 'utf-8');
                let questionsData = JSON.parse(fileContent);

                // If the JSON file does not include a subject field for each question,
                // assign the subject name from the file name.
                questionsData = questionsData.map(q => ({
                    subject: q.subject,
                    question: q.question,
                    options: [q.option_1, q.option_2, q.option_3, q.option_4],
                    answer: q.answer,
                    year: q.year
                }));

                // Insert the questions into the database.
                insertTransaction(questionsData);
                console.log(`Seeded ${questionsData.length} questions for subject "${path.basename(file, '.json')}" from file ${file}`);
            } catch (error) {
                console.error(`Error processing file ${file}:`, error);
            }
        }
    } else {
        console.log("Database already seeded. Skipping seeding step.");
    }
}

seedDatabaseFromFolder();

module.exports = db;