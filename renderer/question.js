
const QuestionModel = require('../models/QuestionModel');
const path = require('path');
const fs = require('fs');

// Load data if the questions table is empty
const rowCount = QuestionModel.count();
if (rowCount === 0) {
    console.log("Seeding database with questions from folder...");
    const questionsFolder = path.join(__dirname, "../assets/questionContent/questions");

    // Check if the folder exists.
    if (!fs.existsSync(questionsFolder)) {
        console.error(`Questions folder not found at ${questionsFolder}`);
        return;
    }

    // Read all files in the questions folder and filter for .json files.
    const files = fs.readdirSync(questionsFolder).filter(file => path.extname(file) === '.json');

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
            QuestionModel.create(questionsData);
            console.log(`Seeded ${questionsData.length} questions for subject "${path.basename(file, '.json')}" from file ${file}`);
        } catch (error) {
            console.error(`Error processing file ${file}:`, error);
        }
    }
} else {
    console.log("Database already seeded. Skipping seeding step.");
}