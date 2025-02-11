import { loadPage } from "../renderer/navigation.js";
import state from "../renderer/state.js";

document.getElementById('jamb-button').addEventListener('click', () => {
    window.api.openSelectSubjectWindow();
});


window.api.onCongratsWindowClosed(() => {
    loadPage('home');
});

// Show exam screen when subjects selection window is closed
window.api.onSecondWindowClosed((_, data) => {
    if (data['action'] === 'exam') {
        state.subjects = data['subjects'];
        state.duration = data['duration'];
        state.selectedSubjects = data['selectedSubjects'];
        state.year = data['year'];

        console.log("state ", state);

        init();

        // Navigate to the Exam page
        loadPage(data['action']);
    }
});


// exam functionality
let timer;
let totalSeconds = 0;

const countdown = document.getElementById('countdown');
const submitBtn = document.getElementById('submit-button');
const progress = document.getElementById('progress');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const attemptedDiv = document.getElementById('attempted-questions');


function startTimer() {
    if (timer) return; // Prevent multiple intervals

    const hours = state.duration['hours'];
    const minutes = state.duration['minutes'];
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
        tabButton.addEventListener('click', () => openTab(subject, tabButton));
        tabContainer.appendChild(tabButton);
    });
}

function openTab(subject, clickedButton) {
    // Get all buttons inside the tab container
    const tabButtons = document.querySelectorAll('.tab .tablinks');
    // Remove the "active" class from each button
    tabButtons.forEach(button => button.classList.remove('active'));
    clickedButton.classList.add('active');

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
            selectAnswer(subjectState);
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
    attemptedDiv.textContent = `${subjectState.userAnswers.length}/${subjectState.questions.length}`;
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
            <input type="radio" name="option" value="${option}" ${subjectState.userAnswers[index] === option ? 'checked' : ''}>
            ${option}
        `;
        label.classList.add('fade-in');
        label.style.animationDelay = `${(i + 1) * 0.2}s`; // Staggered delay
        optionsContainer.appendChild(label);
    });

    renderQuestionNav();
}

function selectAnswer(subjectState) {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        subjectState.userAnswers[subjectState.currentQuestionIndex] = selectedOption.value;
    }
}


function handleNavigation(direction) {
    const subjectState = state.subjects[state.currentSubject];
    selectAnswer(subjectState);

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
    startTimer();

    nextBtn.addEventListener('click', () => handleNavigation(1));
    prevBtn.addEventListener('click', () => handleNavigation(-1));
    submitBtn.addEventListener('click', () => window.api.openCongratsWindow());
    // Set the first subject as the current subject
    state.currentSubject = state.selectedSubjects[0];

    // Render tabs
    renderTabs();

    // Render the first question of the initial subject
    renderQuestion(0);
}