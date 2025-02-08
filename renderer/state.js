// state.js
export function getInitialState() {
    return {
        questions: [], // This will be populated with the fetched questions
        currentQuestionIndex: 0,
        userAnswers: []
    };
}

// Initialize the state
const state = getInitialState();
export default state;
