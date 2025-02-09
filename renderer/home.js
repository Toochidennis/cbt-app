import { loadPage } from "../renderer/navigation.js";
import state from "../renderer/state.js";


document.getElementById('jamb-button').addEventListener('click', () => {
    window.api.openSelectSubjectWindow();
});

window.api.onSecondWindowClosed((_, action) => {
    if (action === 'exam') {
        loadPage(action);
        // window.api.getQuestions().then((quests) => {
        //     state.questions = quests;
        //     // Navigate to the CBT page

        // }).catch((error) => {
        //     console.error('Failed to load questions:', error);
        // });
    }
});
