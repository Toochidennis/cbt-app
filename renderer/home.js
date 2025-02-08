document.getElementById('jamb-button').addEventListener('click', () => {
    window.api.openSelectExamWindow();
    
    // window.api.getQuestions().then((quests) => {
    //     state.questions = quests;
    //     // Navigate to the CBT page
        
    // }).catch((error) => {
    //     console.error('Failed to load questions:', error);
    // });
});