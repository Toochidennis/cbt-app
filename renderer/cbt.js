const state = require('./state.js');

let timer;
let totalSeconds = 0;

const countdown = document.getElementById('countdown');
const submitBtn = document.getElementById('submit-button');
const progress = document.getElementById('progress');
const questionImage = document.getElementById('question-image');
const passageDiv = document.getElementById('passage');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const attemptedDiv = document.getElementById('attempted-questions');

console.log('data, ', state);
window.api.startExam((_, data) => {
     console.log('data, ', data);
    // state.subjects = data.subjects;
    // state.duration = data.duration;
    // state.selectedSubjects = data.selectedSubjects;
    // state.year = data.year;

  //  init();
});

function startTimer() {
    if (timer) return; // Prevent multiple intervals

    const hours = state.duration.hours;
    const minutes = state.duration.minutes;
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
            submitHandler();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    timer = null;
    //isPaused = false;
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

    state.selectedSubjects.forEach((subject, index) => {
        const tabButton = document.createElement('button');
        tabButton.classList = 'tablinks';
        tabButton.textContent = subject;

        if (index === 0) {
            tabButton.classList.add('active');
        }

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

async function renderQuestion(index) {
    const subjectState = state.subjects[state.currentSubject];
    const question = subjectState.questions[index];

    progress.textContent = `Question ${index + 1}/${subjectState.questions.length}`;

    if (question.passage.trim() !== "") {
        passageDiv.innerHTML = capitalizeSentence(question.passage.trim())
        passageDiv.style.display = "block";
    } else {
        passageDiv.style.display = "none";
    }

    attemptedDiv.textContent = `${subjectState.userAnswers.length}/${subjectState.questions.length}`;
    questionText.innerHTML = question.question_text;

    // Build the full path to the question image if it exists
    if (question.question_image && question.question_image.trim() !== "") {
        // Use getImagePath with the selected subject folder
        questionImage.src = await window.api.getImagePath(state.currentSubject, question.question_image);
        questionImage.style.display = "block";
    } else {
        questionImage.style.display = "none";
    }

    // Clear previous options
    optionsContainer.innerHTML = '';

    // Render options
    question.options.forEach(async (option) => {
        const label = document.createElement('label');

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        const optionText = capitalizeSentence(option.text.trim());
        // Decide what to save: if there's text, use that; if not, use the image name.
        const answerValue = optionText && optionText.trim() !== ""
            ? option.text
            : option.image; // Option image filename
        input.value = answerValue;
        input.setAttribute('data-answer', answerValue);

        // Pre-check if the answer is already saved.
        if (subjectState.userAnswers[index] === answerValue) {
            input.checked = true;
        }

        label.appendChild(input);

        // If the option has an image, load it from the subject folder
        if (option.image && option.image.trim() !== "") {
            const img = document.createElement('img');
            img.src = await window.api.getImagePath(state.currentSubject, option.image);
            img.alt = answerValue || 'Option image';
            label.appendChild(img);
        } else {
            // Otherwise, show text
            const span = document.createElement('span');
            span.textContent = capitalizeSentence(answerValue);
            label.appendChild(span);
        }

        input.addEventListener('click', () => {
            selectAnswer(subjectState);
        });

        optionsContainer.appendChild(label);
    });

    renderQuestionNav();
}

function capitalizeSentence(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function selectAnswer(subjectState) {
    const selectedOption = document.querySelector('input[name="option"]:checked');
    if (selectedOption) {
        const answer = selectedOption.getAttribute('data-answer');
        subjectState.userAnswers[subjectState.currentQuestionIndex] = answer;
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

function nextHandler() {
    handleNavigation(1);
}


function prevHandler() {
    handleNavigation(-1);
}

function submitHandler() {
    const correctedData = JSON.parse(JSON.stringify(state));
    window.api.sendExamResults(correctedData);
    loadPage('summary');
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

            const subjectState = state.subjects[state.currentSubject];
            selectAnswer(subjectState);
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


function init() {
    resetTimer();
    startTimer();
    state.currentSubject = state.selectedSubjects[0];
    renderTabs();
    renderQuestion(0);

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
}