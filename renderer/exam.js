import state from '../renderer/state.js';
import { loadPage } from './navigation.js';

let timer;
let totalSeconds = 0;

const countdown = document.getElementById('countdown');
const submitBtn = document.getElementById('submit-button');
const progress = document.getElementById('progress');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');

startTimer();
renderQuestion(state.currentQuestionIndex);

nextBtn.addEventListener('click', () => handleNavigation(1));
prevBtn.addEventListener('click', () => handleNavigation(-1));
submitBtn.addEventListener('click', ()=> window.api.openCongratsWindow());

// document.getElementById('submit-btn').addEventListener('click', () => {
//     loadPage('summary');
// });

function startTimer() {
    if (timer) return; // Prevent multiple intervals

    const hours = 2;
    const minutes = 30;
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

function renderQuestionNav() {
    const questionNav = document.getElementById('question-nav');
    questionNav.innerHTML = '';

    state.questions.map((_, index) => {
        const box = document.createElement('div');
        box.classList.add('question-box');
        box.textContent = index + 1;

        if (state.userAnswers[index]) {
            box.classList.add('answered')
        } else {
            box.classList.add('unanswered');
        }

        box.addEventListener('click', () => {
            state.currentQuestionIndex = index;
            renderQuestion(state.currentQuestionIndex);
        });

        questionNav.appendChild(box);
    });
}

function renderQuestion(index) {
    const question = state.questions[index];

    progress.textContent = `Question ${state.currentQuestionIndex+1}/${state.questions.length}`;
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

function selectAnswer(answer) {
    const currentQuestion = state.questions[state.currentQuestionIndex];
    currentQuestion.userAnswer = answer;
    state.userAnswers[state.currentQuestionIndex] = answer;
}

function handleNavigation(direction) {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        selectAnswer(selectedOption.value);
    }

    state.currentQuestionIndex += direction;

    if (state.currentQuestionIndex < 0) {
        state.currentQuestionIndex = 0;
    } else if (state.currentQuestionIndex >= state.questions.length) {
        state.currentQuestionIndex = state.questions.length - 1;
        document.getElementById('next-btn').style.display = 'none';
    } else {
        document.getElementById('next-btn').style.display = 'inline';
    }

    renderQuestion(state.currentQuestionIndex);
}