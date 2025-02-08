import state from './state.js';
import { loadPage } from './navigation.js';


document.addEventListener('click', (event) => {
    if (event.target && event.target.id === 'start-button') {
        window.api.getQuestions().then((quests) => {
            state.questions = quests;
            // Navigate to the CBT page
            loadPage('cbt');
        }).catch((error) => {
            console.error('Failed to load questions:', error);
        });
    }
});
