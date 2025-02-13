function loadExamSummary() {
    window.api.getExamSummary((_, summary) => {
        console.log('Exam Summary:', summary);
        const score = document.getElementById('score');
        const maxScore = document.getElementById('total-score');

        let overallScore = 0;
        let overallMaxScore = 0;

        // Loop over each subject available in the summary
        Object.keys(summary.subjects).forEach(subject => {
            const subjectState = summary.subjects[subject];
            const subjectQuestions = subjectState.questions;
            const numQuestions = subjectQuestions.length;
            const subjectMaxScore = numQuestions * 2; // Each question is 2 marks
            let subjectScore = 0;

            subjectQuestions.forEach((question, index) => {
                // Retrieve the user's answer for this question (if any)
                const selectedAnswer = subjectState.userAnswers[index];
                const userAnswer = question.options.indexOf(selectedAnswer) + 1;
                console.log('User answer and index: ', selectedAnswer, userAnswer, question.answer);
                // Check if the answer is correct
                const isCorrect = userAnswer === question.answer;
                if (isCorrect) {
                    subjectScore += 2;
                }
            });

            overallScore += subjectScore;
            overallMaxScore += subjectMaxScore;
        });

        score.textContent = overallScore;
        maxScore.textContent = `out of ${overallMaxScore}`;
    });
}

loadExamSummary()


document.getElementById('home-btn').addEventListener('click', () => {
    window.api.closeCongratsWindow();
});