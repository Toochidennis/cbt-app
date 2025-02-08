import state from './state.js';
import { loadPage } from './navigation.js';

function renderSummary() {
    const summaryContainer = document.getElementById('summary-container');
    let correctCount = 0;

    const summaryHTML = state.questions.map((question, index) => {
        const isCorrect = state.userAnswers[index] === question.correctAnswer;
        if (isCorrect) correctCount++;
        return `
            <p>Question ${index + 1}: ${question.question}</p>
            <p>Your answer: ${state.userAnswers[index] || 'No answer selected'}</p>
            <p>Correct answer: ${question.correctAnswer}</p>
            <p>${isCorrect ? 'Correct' : 'Incorrect'}</p>
            <hr>
        `;
    }).join('');

    summaryContainer.innerHTML = summaryHTML;
    summaryContainer.innerHTML += `<p>Total Score: ${correctCount} out of ${state.questions.length}</p>`;
}

renderSummary();

// function resetQuiz() {
//     // Reset the state
//     Object.assign(state, getInitialState());

//     // Fetch the questions again
//     window.api.getQuestions().then((quests) => {
//         state.questions = quests;

//         // Navigate to the CBT page
//         loadPage('cbt');
//     }).catch((error) => {
//         console.error('Failed to load questions:', error);
//         // Optionally, display an error message to the user
//     });
// }

// document.addEventListener("click", (event) => {
//     if (event.target && event.target.id === "retake-btn") {
//         resetQuiz();
//     }
// });

document.getElementById('home-btn').addEventListener('click', () => {
    // Logic to navigate back to the home page
    // For example, you might load the home page
    loadPage('welcome');
});
