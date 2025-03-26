(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const loadPage = require('./navigation.js');
const state = require('./state.js');

function slider() {
    const slider = document.querySelector(".slider");
    const slides = document.querySelectorAll(".slide");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const festBtn = document.getElementById('fest-btn');
    const bootCampBtn = document.getElementById('boot-camp-btn');
    const challengeBtn = document.getElementById('challenge-btn');

    let index = 0;

    function showSlide(index) {
        const slideWidth = slides[0].clientWidth;
        slider.style.transform = `translateX(-${index * slideWidth}px)`;
    }

    nextBtn.addEventListener("click", () => {
        index = (index + 1) % slides.length;
        showSlide(index);
    });

    prevBtn.addEventListener("click", () => {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
    });

    festBtn.addEventListener('click', ()=>{
      window.api.openLink('https://forms.gle/wMh3PcgVNCfo1E229');
    });

    bootCampBtn.addEventListener('click', ()=>{
        window.api.openLink('https://forms.gle/teJJV3W7nqkYC2qe8');
    });

    challengeBtn.addEventListener('click', ()=>{
        window.api.openLink('https://forms.gle/H4RdFpvvDJ2L8LT2A');
    });

    // Auto-slide every 5 seconds
    setInterval(() => {
        index = (index + 1) % slides.length;
        showSlide(index);
    }, 4000);
}

slider();

document.getElementById('jamb-button').addEventListener('click', async () => {
    const activated = await window.api.getActivationState();

    if (!activated) {
        window.api.openActivationWindow();
    } else {
        window.api.openSelectSubjectWindow();

        // Proceed to show the exam page.
        console.log("Activation confirmed. Proceeding to exam...");
    }
    // window.api.openSelectSubjectWindow();
});


// window.api.onCongratsWindowClosed(() => {
    
//     window.api.setFullScreen(false);
// });

// Show exam screen when subjects selection window is closed
window.api.onSecondWindowClosed((_, data) => {
    if (data.action === 'cbt') {
        state.subjects = data.subjects;
        state.duration = data.duration;
        state.selectedSubjects = data.selectedSubjects;
        state.year = data.year;

        init();

        window.api.setFullScreen(true);

        loadPage(data.action);
    }
});


// exam functionality
let timer;
let totalSeconds = 0;

const countdown = document.getElementById('countdown');
const submitBtn = document.getElementById('submit-button');
const progress = document.getElementById('progress');
const questionImage = document.getElementById('question-image');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');
const attemptedDiv = document.getElementById('attempted-questions');


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
    attemptedDiv.textContent = `${subjectState.userAnswers.length}/${subjectState.questions.length}`;
    questionText.textContent = question.question_text;

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

    // Apply fade-in animation to question text
    questionText.classList.remove('fade-in');
    void questionText.offsetWidth; // Trigger reflow to restart animation
    questionText.classList.add('fade-in');

    // Render options with staggered animation
    question.options.forEach(async (option, i) => {
        const label = document.createElement('label');
        label.classList.add('fade-in');
        label.style.animationDelay = `${(i + 1) * 0.2}s`;

        const input = document.createElement('input');
        input.type = 'radio';
        input.name = 'option';
        const optionText = capitalizeSentence(option.text);
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
},{"./navigation.js":2,"./state.js":3}],2:[function(require,module,exports){
// export function loadPage(page) {
//     fetch(`pages/${page}.html`)
//         .then(response => response.text())
//         .then(html => {
//             const appDiv = document.getElementById('app');
//             appDiv.innerHTML = html;
//             const script = document.createElement('script');
//             script.type = 'module';
//             script.src = `renderer/${page}.js`;
//             document.body.appendChild(script);
//         })
//         .catch(err => console.error('Error loading page:', err));
// }

function loadPage(page) {
    const homeDiv = document.getElementById('home');
    const examDiv = document.getElementById('cbt');
    const summaryDiv = document.getElementById('summary');

    if (page === 'cbt') {
        homeDiv.classList.add('hidden');
        summaryDiv.classList.add('hidden');
        examDiv.classList.remove('hidden');
    } else if (page === 'home') {
        examDiv.classList.add('hidden');
        summaryDiv.classList.add('hidden');
        homeDiv.classList.remove('hidden');
    }else if(page === 'summary'){
        examDiv.classList.add('hidden');
        homeDiv.classList.add('hidden');
        summaryDiv.classList.remove('hidden');
    }
}

module.exports = loadPage;

},{}],3:[function(require,module,exports){
// state.js
function getInitialState() {
    return {
        subjects: {},
        selectedSubjects: [],
        currentSubject: '',
        year: 0,
        duration: { hours: 0, minutes: 0 }
    };
}

// Initialize the state
const state = getInitialState();
module.exports =  {state, getInitialState};

},{}]},{},[1]);
