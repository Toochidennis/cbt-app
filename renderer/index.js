import { switchPage } from "./navigation.js";
import state from "./state.js";


let timer;
let totalSeconds = 0;

const contentDiv = document.getElementById("content");

const observer = new MutationObserver(() => {
    // console.log("Content changed! Now we can interact with new elements.");
    attachEventListeners();
});

observer.disconnect();
observer.observe(contentDiv, { childList: true, subtree: true });


function attachEventListeners() {
  //  slider();

    document.getElementById('jamb-button').addEventListener('click', async () => {
        const activated = await window.api.getActivationState();
    
        // if (!activated) {
        //     window.api.openActivationWindow();
        // } else {
        //     window.api.openSelectSubjectWindow();
    
        //     // Proceed to show the exam page.
        //     console.log("Activation confirmed. Proceeding to exam...");
        // }
        window.api.openSelectSubjectWindow();
    });

}



window.api.onCongratsWindowClosed(() => {
    loadPage('cbt-dashboard');
    window.api.setFullScreen(false);
});

// Show exam screen when subjects selection window is closed
window.api.onSecondWindowClosed((_, data) => {
    if (data.action === 'cbt-exam') {
        state.subjects = data.subjects;
        state.duration = data.duration;
        state.selectedSubjects = data.selectedSubjects;
        state.year = data.year;

        // Navigate to the Exam page
        switchPage(data.action);

        init();

        window.api.setFullScreen(true);

    }
});


function init() {
    resetTimer();
    startTimer();
    state.currentSubject = state.selectedSubjects[0];
    renderTabs();
    renderQuestion(0);

    const submitBtn = document.getElementById('submit-button');


    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');

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

function slider() {
    const slider = document.querySelector(".slider");
    const slides = document.querySelectorAll(".slide");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");

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

    // Auto-slide every 5 seconds
    setInterval(() => {
        index = (index + 1) % slides.length;
        showSlide(index);
    }, 4000);
}


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
    const countdown = document.getElementById('countdown');

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
    const progress = document.getElementById('progress');
    const questionImage = document.getElementById('question-image');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const attemptedDiv = document.getElementById('attempted-questions');

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
    window.api.openCongratsWindow(state);
}

function keyboardShortcutsHandler(event) {
    event.preventDefault();
    if (event.key === 'ArrowLeft') return handleNavigation(-1);
    if (event.key === 'ArrowRight') return handleNavigation(1);
    if (!isNaN(event.key) && event.key !== '0') {
        const options = document.querySelectorAll('input[name="option"]');
        if (options[event.key - 1]) options[event.key - 1].checked = true;
        selectAnswer(state.subjects[state.currentSubject]);
    }
    if (['p', 'n', 's'].includes(event.key)) ({ p: prevHandler, n: nextHandler, s: submitHandler }[event.key])();
}