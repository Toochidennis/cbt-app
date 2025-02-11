// state.js
export function getInitialState() {
    return {
        subjects: {},
        selectedSubjects: [],
        currentSubject: '',
        year: 0,
        duration: { hours: 0, minutes: 0 }
    };
}

// Initialize the state
const state = getInitialState();
export default state;
