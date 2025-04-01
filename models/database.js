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

const dbPath = path.join(dataDir, 'questions_21.db');

// Open or create database file
const db = new Database(dbPath);

// Create table if not exist
const query = `
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        subject TEXT,
        question_image TEXT,
        passage TEXT,
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


module.exports =  db;