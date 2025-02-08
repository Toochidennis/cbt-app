import state from './state.js';
import { loadPage } from './navigation.js';

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
    const questionContainer = document.getElementById('question-container');
    const question = state.questions[index];
    questionContainer.innerHTML = `
    <p>${question.question} hello</p>
    ${question.options.map((option, i) => `
    <label>
        <input type="radio" name="option" value="${option}" ${question.userAnswer === option ? 'checked' : ''}>
        ${String.fromCharCode(65 + i)}. ${option}
    </label><br>
    `).join('')
        }
    `;

    renderQuestionNav();
}

renderQuestion(state.currentQuestionIndex);

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
        document.getElementById('submit-btn').style.display = 'inline';
    } else {
        document.getElementById('next-btn').style.display = 'inline';
        document.getElementById('submit-btn').style.display = 'none';
    }

    renderQuestion(state.currentQuestionIndex);
}

document.getElementById('next-btn').addEventListener('click', () => handleNavigation(1));
document.getElementById('prev-btn').addEventListener('click', () => handleNavigation(-1));

document.getElementById('submit-btn').addEventListener('click', () => {
    loadPage('summary');
});

