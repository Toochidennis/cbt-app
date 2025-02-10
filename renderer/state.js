// state.js
export function getInitialState() {
    return {
        subjects: {},
        selectedSubjects: [],
        currentSubject: '',
        year: 0,
        hour: 0,
        minute: 0,
    };
}

// Initialize the state
const state = getInitialState();
export default state;
