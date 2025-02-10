import state from '../renderer/state.js';

let timer;
let totalSeconds = 0;

const countdown = document.getElementById('countdown');
const submitBtn = document.getElementById('submit-button');
const progress = document.getElementById('progress');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');


function startTimer() {
    if (timer) return; // Prevent multiple intervals

    const hours = state.hour;
    const minutes = state.minute;
    const seconds = 0;
    totalSeconds = hours * 3600 + minutes * 60 + seconds;

    if (totalSeconds <= 0) return;

    timer = setInterval(() => {
        if (totalSeconds > 0) {
            totalSeconds--;
            updateDisplay();
        } else {
            clearInterval(timer);
            timer = null;
            alert('Time is up!');
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    timer = null;
    isPaused = false;
    totalSeconds = 0;
    updateDisplay();
}

function updateDisplay() {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    countdown.textContent = `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s`;
}

function pad(num) {
    return num.toString().padStart(2, '0');
}

function renderTabs() {
    const tabContainer = document.querySelector('.tab');
    tabContainer.innerHTML = '';

    state.selectedSubjects.forEach(subject => {
        const tabButton = document.createElement('button');
        tabButton.classList = 'tablinks';
        tabButton.textContent = subject;
        tabButton.addEventListener('click', () => openTab(subject));
        tabContainer.appendChild(tabButton);
    });
}

function openTab(subject) {
    state.currentSubject = subject;

    renderQuestion(state.subjects[subject].currentQuestionIndex);
}

function renderQuestionNav() {
    const subjectState = state.subjects[state.currentSubject];
    const questionNav = document.getElementById('question-nav');
    questionNav.innerHTML = '';

    subjectState.questions.map((_, index) => {
        const box = document.createElement('div');
        box.classList.add('question-box');
        box.textContent = index + 1;

        if (subjectState.userAnswers[index]) {
            box.classList.add('answered')
        } else {
            box.classList.add('unanswered');
        }

        box.addEventListener('click', () => {
            subjectState.currentQuestionIndex = index;
            renderQuestion(subjectState.currentQuestionIndex);
        });

        questionNav.appendChild(box);
    });
}

function renderQuestion(index) {
    const subjectState = state.subjects[state.currentSubject];
    const question = subjectState.questions[index];

    progress.textContent = `Question ${index + 1}/${subjectState.questions.length}`;
    questionText.textContent = question.question;

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Apply fade-in animation to question text
    questionText.classList.remove('fade-in');
    void questionText.offsetWidth; // Trigger reflow to restart animation
    questionText.classList.add('fade-in');

    // Render options with staggered animation
    question.options.forEach((option, i) => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="radio" name="option" value="${option}" ${question.userAnswer === option ? 'checked' : ''}>
            ${option}
        `;
        label.classList.add('fade-in');
        label.style.animationDelay = `${(i + 1) * 0.2}s`; // Staggered delay
        optionsContainer.appendChild(label);
    });

    renderQuestionNav();
}


function handleNavigation(direction) {
    const subjectState = state.subjects[state.currentSubject];
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        subjectState.userAnswers[subjectState.currentQuestionIndex] = selectedOption.value;
    }

    subjectState.currentQuestionIndex += direction;

    if (subjectState.currentQuestionIndex < 0) {
        subjectState.currentQuestionIndex = 0;
    } else if (subjectState.currentQuestionIndex >= subjectState.questions.length) {
        subjectState.currentQuestionIndex = subjectState.questions.length - 1;
        document.getElementById('next-btn').style.display = 'none';
    } else {
        document.getElementById('next-btn').style.display = 'inline';
    }

    renderQuestion(subjectState.currentQuestionIndex);
}

function init() {
    console.log(state);
    // startTimer();

    // nextBtn.addEventListener('click', () => handleNavigation(1));
    // prevBtn.addEventListener('click', () => handleNavigation(-1));
    // submitBtn.addEventListener('click', () => window.api.openCongratsWindow());
    // // Set the first subject as the current subject
    // state.currentSubject = state.selectedSubjects[0];

    // // Render tabs
    // renderTabs();

    // // Load questions for each subject (this should be replaced with actual data fetching logic)
    // // selectedSubjects.forEach(subject => {
    // //     state.subjects[subject].questions = loadQuestionsForSubject(subject);
    // // });

    // // Render the first question of the initial subject
    // renderQuestion(0);
}

function loadQuestionsForSubject(subject) {
    // Replace this with actual logic to fetch questions for the given subject
    return [
        {
            question: `Sample question 1 for ${subject}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D']
        },
        {
            question: `Sample question 2 for ${subject}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D']
        }
        // Add more questions as needed
    ];
}
