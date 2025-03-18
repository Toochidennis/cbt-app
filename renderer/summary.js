const Chart = require('chart.js/auto');

let state = [];

const subjectShortNames = {
    "computer studies": "Computer",
    "english language": "English",
    "agricultural science": "Agric",
    "social studies": "Social",
    "literature in english": "Literature",
};

const closeBtn = document.getElementById('close-btn');
const score = document.getElementById('you-scored');
const pointsCanvas = document.getElementById('points-chart').getContext('2d');
const chartText = document.getElementById('chart-text');
const performanceCanvas = document.getElementById('doughnut-chart').getContext('2d');
const analysisCanvas = document.getElementById('analysis-chart').getContext('2d');
const questionsContainer = document.getElementById('questions-container');

function renderTabs() {
    const tabContainer = document.querySelector('.tab');
    tabContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    state.selectedSubjects.forEach((subject, index) => {
        const tabButton = document.createElement('button');
        tabButton.classList.add('tablinks');
        tabButton.textContent = subject;

        if (index === 0) tabButton.classList.add('active');

        tabButton.addEventListener('click', () => openTab(subject, tabButton));
        fragment.appendChild(tabButton);
    });

    tabContainer.appendChild(fragment);
}

function openTab(subject, clickedButton) {
    document.querySelectorAll('.tab .tablinks').forEach(button => button.classList.remove('active'));
    clickedButton.classList.add('active');

    state.currentSubject = subject;
    renderQuestion();
}

async function renderQuestion() {
    const subjectState = state.subjects[state.currentSubject];
    questionsContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    for (const [index, question] of subjectState.questions.entries()) {
        const questionsContent = document.createElement('div');
        questionsContent.classList.add('questions-content');

        const questionLine = document.createElement('div');
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');

        const progress = document.createElement('div');
        progress.classList.add('progress');
        progress.textContent = `Question ${index + 1}/${subjectState.questions.length}`;

        const imageDiv = document.createElement('div');
        imageDiv.classList.add('question-image-container');

        const questionImage = document.createElement('img');
        questionImage.classList.add('question-image');
        if (question.question_image?.trim()) {
            questionImage.src = await window.api.getImagePath(state.currentSubject, question.question_image);
            questionImage.style.display = "block";
        } else {
            questionImage.style.display = "none";
        }
        imageDiv.appendChild(questionImage);

        const questionText = document.createElement('div');
        questionText.classList.add('question-text');
        questionText.textContent = question.question_text;

        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container');

        const selectedAnswer = subjectState.userAnswers[index];

        // Render options
        question.options.forEach(async (option) => {
            const label = document.createElement('label');

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `option_${index}`;
            const optionText = capitalizeSentence(option.text?.trim() || '');
            input.value = optionText;

            if (selectedAnswer?.trim().toLowerCase() === optionText.toLowerCase()) {
                input.checked = true;
            }

            label.appendChild(input);

            if (option.image?.trim()) {
                const img = document.createElement('img');
                img.src = await window.api.getImagePath(state.currentSubject, option.image);
                img.alt = optionText || 'Option image';
                label.appendChild(img);
            } else {
                const span = document.createElement('span');
                span.textContent = optionText;
                label.appendChild(span);
            }

            optionsContainer.appendChild(label);
        });

        questionDiv.append(progress, imageDiv, questionText, optionsContainer);
        questionsContent.append(questionLine, questionDiv);

        // Highlight correct & incorrect answers
        const optionIndex = question.options.findIndex(option => 
            (option.text?.trim() || option.image) === selectedAnswer
        );

        const correctAnswerIndex = question.answer - 1;

        if (optionIndex === correctAnswerIndex) {
            questionLine.classList.add("correct-line");
        } else {
            questionLine.classList.add("incorrect-line");
            optionsContainer.children[optionIndex]?.classList.add("incorrect-answer");
        }
        optionsContainer.children[correctAnswerIndex]?.classList.add("correct-answer");

        fragment.appendChild(questionsContent);
    }

    questionsContainer.appendChild(fragment);
}

function capitalizeSentence(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}


function getShortSubjectName(subject) {
    return subjectShortNames[subject.toLowerCase()] || subject; 
}


function loadExamSummary() {
    window.api.getExamSummary((_, summary) => {
        state = summary;
        let overallScore = 0;
        let overallMaxScore = 0;
        let chartsData = {};

        Object.entries(summary.subjects).forEach(([subject, subjectState]) => {
            const numQuestions = subjectState.questions.length;
            const subjectMaxScore = numQuestions * 2; // Each question is 2 marks
            let subjectScore = subjectState.questions.reduce((score, question, index) => {
                const selectedAnswer = subjectState.userAnswers[index];
                const userAnswerIndex = question.options.findIndex(option => 
                    (option.text?.trim() || option.image) === selectedAnswer
                );
                return userAnswerIndex + 1 === question.answer ? score + 2 : score;
            }, 0);

            overallScore += subjectScore;
            overallMaxScore += subjectMaxScore;
            chartsData[subject] = { score: subjectScore, maxScore: subjectMaxScore };
        });

        score.textContent = `You scored ${overallScore} points`;
        const result = processScores(chartsData);

        // Plot charts
        pointsChart(result.totalScore, result.totalMaxScore);
        performanceChart(result.overallPassed, result.overallFailed, result.totalMaxScore);
        analysisChart(result.subjectsData);

        state.currentSubject = state.selectedSubjects[0];
        renderTabs();
        renderQuestion();
    });
}

const processScores = (subjects) => {
    let totalScore = 0, totalMaxScore = 0;
    let overallPassed = 0, overallFailed = 0;
    let subjectsData = Object.entries(subjects).map(([subjectKey, subject]) => {
        totalScore += subject.score;
        totalMaxScore += subject.maxScore;
        overallPassed += subject.score;
        overallFailed += subject.maxScore - subject.score;
        return { subject: subjectKey, passed: subject.score, failed: subject.maxScore - subject.score };
    });
    return { totalScore, totalMaxScore, subjectsData, overallPassed, overallFailed };
};


function pointsChart(score, maxScore) {
    chartText.innerHTML = `${score} <span>points</span>`;

    new Chart(pointsCanvas, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [score, maxScore],
                backgroundColor: [
                    'rgba(95, 255, 100, 1)', 'rgba(105, 105, 105, 0.1)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            circumference: 180,
            cutout: '65%',
            borderWidth: 0,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            }
        }
    });
}

function performanceChart(passedScores, failedScores, maxScore) {
    new Chart(performanceCanvas, {
        type: 'doughnut',
        data: {
            labels: ['Correct', 'Wrong'],
            datasets: [{
                data: [passedScores, maxScore],
                backgroundColor: [
                    '#FC9338', 'rgba(105, 105, 105, 0.1)'
                ]
            }, {
                data: [failedScores, maxScore],
                backgroundColor: [
                    '#2549CA', 'rgba(105, 105, 105, 0.1)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            rotation: -90,
            cutout: '50%',
            borderWidth: 10,
            borderRadius: 10,
            hoverBorderWidth: 0,
            plugins: {
                legend: {
                    display: true,
                    position: 'right'
                },
                //tooltip: { enabled: false },
            }
        }
    });
}

function analysisChart(subjectsData) {
    // Extract keys (subjects)
    const keys = Object.keys(subjectsData);

    // Extract passed and failed scores
    const chartLabels = state.selectedSubjects.map(getShortSubjectName);
    const passedScores = keys.map(key => subjectsData[key].passed);
    const failedScores = keys.map(key => subjectsData[key].failed);

    const passedColors = ["#6983DD", "#D96DC6", "#FFAC51", "#0CCADF"];
    const failedColors = [
        "rgba(105, 131, 221, 0.2)",
        "rgba(217, 109, 198, 0.2)",
        "rgba(255, 172, 81, 0.2)",
        "rgba(12, 202, 223, 0.2)"
    ];

    new Chart(analysisCanvas, {
        type: "bar",
        data: {
            labels: chartLabels,
            datasets: [
                {
                    label: "Failed",
                    data: failedScores,
                    backgroundColor: failedColors,
                    order: 1,
                    borderColor: failedColors
                },
                {
                    label: "Passed",
                    data: passedScores,
                    backgroundColor: passedColors,
                    order: 0,
                    borderColor: passedColors
                },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            barPercentage: 0.3,
            borderWidth: 0,
            borderRadius: 30,
            scales: {
                x: {
                    stacked: true,
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        autoSkip: false,
                        maxRotation: 65,  // Rotate labels vertically
                        minRotation: 65
                    }
                },
                y: {
                    max: 100,
                    beginAtZero: true,
                    ticks: {
                        callback: function (value) {
                            return value + " points";
                        }
                    },
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

closeBtn.addEventListener('click', () => {
    window.api.closeCongratsWindow();
});

loadExamSummary();