async function loadExamSummary() {
    try {
        const summary = await window.api.getExamSummary();
        console.log('Exam Summary:', summary);
        // Update the UI with the summary details
    } catch (error) {
        console.error('Error loading exam summary:', error);
    }
}


document.getElementById('home-btn').addEventListener('click', () => {
    window.api.closeCongratsWindow();
});