const axios = require('axios');
const Chart = require('chart.js/auto');

const quizState = {
    questions: [],
    currentQuestionIndex: 0,
    userAnswers: [],
};

let pointsChart = null;

const { courseId, lessonId } = JSON.parse(localStorage.getItem('quizData'));
const { id: categoryId, isFree, limit } = JSON.parse(localStorage.getItem('category'));

const submitBtn = document.getElementById('submit-button');
const closeBtn = document.getElementById('close-btn');
const progress = document.getElementById('progress');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const score = document.getElementById('you-scored');
const pointsCanvas = document.getElementById('points-chart').getContext('2d');
const chartText = document.getElementById('chart-text');
const questionsContainer = document.getElementById('questions-container');

fetchQuestions();

function showLoader() {
    const loaderContainer = document.createElement('div');
    loaderContainer.id = 'loader-container';
    const loader = document.createElement('div');
    loader.id = 'loader';

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    loaderContainer.appendChild(loader);
    document.body.appendChild(loaderContainer);
}

function hideLoader() {
    const loaderContainer = document.getElementById('loader-container');
    if (loaderContainer) {
        loaderContainer.remove();
    }
}

function fetchQuestions() {
    const url = categoryId === 1 ? `https://linkschoolonline.com/lesson-quiz-2?lesson_id=${lessonId}&course_id=${courseId}`
    : `https://linkschoolonline.com/lesson-quiz?lesson_id=${lessonId}&course_id=${courseId}`;

    showLoader();
    axios.get(url)
        .then(response => {
            console.log(response.data);
            formatQuestions(response.data);
            hideLoader();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function formatQuestions(response) {
    if (!response || response.length === 0) return;

    questionsData = response.map(q => ({
        question_text: q.question_text,
        options: [
            q.option_1_text,
            q.option_2_text,
            q.option_3_text,
            q.option_4_text,
        ],
        answer: q.answer,
    }));

    quizState.questions = questionsData;
    init();
}

function init() {
    renderQuestion(quizState.currentQuestionIndex);

    // Remove any previously attached listeners (if any)
    nextBtn.removeEventListener('click', nextHandler);
    prevBtn.removeEventListener('click', prevHandler);
    submitBtn.removeEventListener('click', submitHandler);
    document.removeEventListener('keydown', keyboardShortcutsHandler);

    // Then add the event listeners
    nextBtn.addEventListener('click', nextHandler);
    prevBtn.addEventListener('click', prevHandler);
    submitBtn.addEventListener('click', submitHandler);
    document.addEventListener('keydown', keyboardShortcutsHandler);
    closeBtn.addEventListener('click', () => {
        window.api.closeQuizWindow(lessonId);
    });
}

function renderQuestion(index) {
    const question = quizState.questions[index];
    //  console.log('at 0, ', question);

    progress.textContent = `Question ${index + 1}/${quizState.questions.length}`;
    questionText.innerHTML = question.question_text;

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Render options
    question.options.forEach((option) => {
        const label = document.createElement('label');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        input.value = option;
        input.setAttribute('data-answer', option);

        // Pre-check if the answer is already saved.
        if (quizState.userAnswers[index] === option) {
            input.checked = true;
        }

        label.appendChild(input);

        const span = document.createElement('span');
        span.textContent = capitalizeSentence(option);
        label.appendChild(span);

        input.addEventListener('click', () => {
            selectAnswer();
        });

        optionsContainer.appendChild(label);
    });
}

function capitalizeSentence(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function selectAnswer() {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        const answer = selectedOption.getAttribute('data-answer');
        quizState.userAnswers[quizState.currentQuestionIndex] = answer;
    }
}

function handleNavigation(direction) {
    selectAnswer();

    quizState.currentQuestionIndex += direction;

    if (quizState.currentQuestionIndex < 0) {
        quizState.currentQuestionIndex = 0;
    } else if (quizState.currentQuestionIndex >= quizState.questions.length) {
        quizState.currentQuestionIndex = quizState.questions.length - 1;
        document.getElementById('next-btn').style.display = 'none';
    } else {
        document.getElementById('next-btn').style.display = 'inline';
    }

    renderQuestion(quizState.currentQuestionIndex);
}

function nextHandler() {
    handleNavigation(1);
}

function prevHandler() {
    handleNavigation(-1);
}

function submitHandler() {
    loadSummaryPage();
}

function loadSummaryPage() {
    submitBtn.style.display = 'none';
    document.getElementById('cbt').style.display = 'none';
    document.getElementById('summary').style.display = 'block';
    closeBtn.style.display = 'block';

    renderSummary();
}

function keyboardShortcutsHandler(event) {
    event.preventDefault();
    // First, handle arrow keys for navigation
    if (event.key === 'ArrowLeft') {
        handleNavigation(-1);
        return;
    }
    if (event.key === 'ArrowRight') {
        handleNavigation(1);
        return;
    }

    const key = event.key.toLowerCase();

    if (!isNaN(key) && key !== '0') {
        const optionIndex = parseInt(key) - 1;
        const options = document.querySelectorAll('input[name="option"]');
        if (options && optionIndex < options.length) {
            options[optionIndex].checked = true;
            selectAnswer();
        }
    }

    switch (key) {
        case 'p':
            prevHandler();
            break;
        case 'n':
            nextHandler();
            break;
        case 's':
            submitHandler();
            break;
        default:
            break;
    }
}

function renderSummary() {
    //  const numQuestions = quizState.questions.length;
    const quizMaxScore = 100;
    let quizScore = quizState.questions.reduce((score, question, index) => {
        console.log('answers ', quizState.userAnswers);
        const selectedAnswer = quizState.userAnswers[index];
        const userAnswerIndex = question.options.findIndex(option =>
            option?.trim() === selectedAnswer
        );
        console.log('user index ', userAnswerIndex);
        return userAnswerIndex + 1 === question.answer ? score + 5 : score;
    }, 0);

    quizScore *= 2;
    score.textContent = `You scored ${quizScore} points`;
    localStorage.setItem(`quiz_${courseId}_${lessonId}`,
        JSON.stringify(
            {
                quizScore,
                quizMaxScore,
            }
        ));
    plotPointsChart(quizScore, quizMaxScore);

    renderSummaryQuestion()
}


function renderSummaryQuestion() {
    questionsContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();

    for (const [index, question] of quizState.questions.entries()) {
        const questionsContent = document.createElement('div');
        questionsContent.classList.add('questions-content');

        const questionLine = document.createElement('div');
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');

        const progress = document.createElement('div');
        progress.classList.add('progress');
        progress.textContent = `Question ${index + 1}/${quizState.questions.length}`;

        const questionText = document.createElement('div');
        questionText.classList.add('question-text');
        questionText.innerHTML = question.question_text;

        const optionsContainer = document.createElement('div');
        optionsContainer.classList.add('options-container-summary');

        const selectedAnswer = quizState.userAnswers[index];

        question.options.forEach((option) => {
            const label = document.createElement('label');

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `option_${index}`;
            const optionText = capitalizeSentence(option?.trim() || '');
            input.value = optionText;

            if (selectedAnswer?.trim().toLowerCase() === optionText.toLowerCase()) {
                input.checked = true;
            }

            label.appendChild(input);

            const span = document.createElement('span');
            span.textContent = optionText;
            label.appendChild(span);

            optionsContainer.appendChild(label);
        });

        questionDiv.append(progress, questionText, optionsContainer);
        questionsContent.append(questionLine, questionDiv);

        // Highlight correct & incorrect answers
        const optionIndex = question.options.findIndex(option =>
            option === selectedAnswer
        );

        const correctAnswerIndex = question.answer - 1;

        // console.log('Selected answer index ', optionIndex);
        // console.log('Correct answer ', correctAnswerIndex);
        // console.log('Select answer ', selectedAnswer);

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

function plotPointsChart(score, maxScore) {
    chartText.innerHTML = `${score} <span>points</span>`;

    if (pointsChart) {
        pointsChart.destroy();
    }

    pointsChart = new Chart(pointsCanvas, {
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
