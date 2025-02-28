const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// Define the path to your SQLite database file.
const dataDir = path.join(app.getPath('userData'), 'data');

// Create dir if not exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'questions_4.db');

// Open or create database file
const db = new Database(dbPath);

// Create table if not exist
const query = `
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT,
        question_image TEXT,
        question_text TEXT,
        options TEXT,
        answer INTEGER,
        year INTEGER
    );
`;

db.exec(query);

// Create a table for activation state if it doesn't exist.
db.exec(`
    CREATE TABLE IF NOT EXISTS activation (
        key TEXT PRIMARY KEY,
        value TEXT
    );
`);

// const createSummaryTableStmt = `
//     CREATE TABLE IF NOT EXISTS exam_summary (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         exam_date TEXT,
//         subjects TEXT,
//         details TEXT
//     );
// `;

// db.exec(createSummaryTableStmt);

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
            "INSERT INTO questions (subject, question_image, question_text, options, answer, year) VALUES (?, ?, ?, ?, ?, ?)"
        );

        // Create a transaction for batch inserting.
        const insertTransaction = db.transaction((questions) => {
            for (const q of questions) {
                // Convert the options array to a JSON string.
                const optionsStr = JSON.stringify(q.options);
                insertStmt.run(q.subject, q.question_image, q.question_text, optionsStr, q.answer, q.year);
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
                    question_image: q.question_image,
                    question_text: q.question_text,
                    options: [
                        { text: q.option_1_text, image: q.option_1_image },
                        { text: q.option_2_text, image: q.option_2_image },
                        { text: q.option_3_text, image: q.option_3_image },
                        { text: q.option_4_text, image: q.option_4_image }
                    ],
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

// Function to save activation state.
function saveActivationState(isActivated) {
    const stmt = db.prepare(`INSERT OR REPLACE INTO activation (key, value) VALUES (?, ?)`);
    stmt.run('activated', isActivated ? 'true' : 'false');
}

// Function to get the activation state.
function getActivationState() {
    const stmt = db.prepare(`SELECT value FROM activation WHERE key = ?`);
    const row = stmt.get('activated');
    return row && row.value === 'true';
}

module.exports = { saveActivationState, getActivationState, db };