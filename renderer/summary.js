import state from './state.js';

function renderSummary() {
    const summaryContainer = document.getElementById('summary-container');
    summaryContainer.innerHTML = ''; // Clear previous content

    let overallScore = 0;
    let overallMaxScore = 0;
    let summaryHTML = '';

    // Loop over each subject available in the state
    Object.keys(state.subjects).forEach(subject => {
        const subjectState = state.subjects[subject];
        const subjectQuestions = subjectState.questions;
        const numQuestions = subjectQuestions.length;
        const subjectMaxScore = numQuestions * 2; // Each question is 2 marks
        let subjectScore = 0;

        summaryHTML += `<h2>${subject}</h2>`;

        subjectQuestions.forEach((question, index) => {
            // Retrieve the user's answer for this question (if any)
            const userAnswer = subjectState.userAnswers[index];
            // Check if the answer is correct
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) {
                subjectScore += 2;
            }
            summaryHTML += `
            <p>Question ${index + 1}: ${question.question}</p>
            <p>Your answer: ${userAnswer || 'No answer selected'}</p>
            <p>Correct answer: ${question.correctAnswer}</p>
            <p>${isCorrect ? 'Correct' : 'Incorrect'}</p>
            <hr>
        `;
        });

        summaryHTML += `<p><strong>${subject} Score: ${subjectScore} / ${subjectMaxScore}</strong></p>`;
        overallScore += subjectScore;
        overallMaxScore += subjectMaxScore;
    });

    summaryHTML += `<h2>Total Score: ${overallScore} out of ${overallMaxScore}</h2>`;
    summaryContainer.innerHTML = summaryHTML;
}

renderSummary();

document.getElementById('home-btn').addEventListener('click', () => {
    // Logic to navigate back to the home page
    // For example, you might load the home page
    loadPage('welcome');
});
