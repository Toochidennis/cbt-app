let data = {
    subjects: {},
    selectedSubjects: [],
    year: 0,
    duration: { hours: 0, minutes: 0 },
    action: 'exam'
};

const feedback = document.getElementById('feedback');

document.addEventListener("DOMContentLoaded", function () {
    const closeModalBtn = document.getElementById("close-button");
    const yearDropdown = document.getElementById("exam-year");
    const startBtn = document.getElementById("start-exam");
    const checkboxes = document.querySelectorAll('.checkbox');
    const maxSelection = 4;

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            const checkedCheckboxes = document.querySelectorAll('.checkbox:checked');

            if (checkedCheckboxes.length > maxSelection) {
                this.checked = false;
                feedback.textContent = 'You can select up to ' + maxSelection + ' subjects only.';
            } else {
                feedback.textContent = '';
            }
        });
    });

    closeModalBtn.addEventListener('click', () => {
        window.api.closeSelectSubjectWindow('home');
    });

    startBtn.addEventListener('click', () => {
        validateSelectionAndProceed(yearDropdown.value);
    });

    // Populate the year dropdown dynamically
    const currentYear = new Date().getFullYear() - 1;
    for (let year = currentYear; year >= 2020; year--) {
        let option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    }
});

function getSelectedSubjects() {
    const selected = [];
    const checkedCheckboxes = document.querySelectorAll('.checkbox:checked');

    checkedCheckboxes.forEach(checkbox => {
        selected.push(checkbox.nextElementSibling.textContent);
    });

    return selected;
}

function getDuration() {
    const hours = document.getElementById('hour').value;
    const minutes = document.getElementById('minutes').value;

    return { hours: hours, minutes: minutes };
}

async function validateSelectionAndProceed(year) {
    const duration = getDuration();
    const subjects = getSelectedSubjects();

    if (subjects.length === 0) {
        feedback.textContent = 'Select at least one subject';
        return;
    } else if (!duration['hours'] && !duration['minutes']) {
        feedback.textContent = 'Hour or time is required';
        return;
    } else if (!year) {
        feedback.textContent = 'Year is required';
        return;
    } else {
        feedback.textContent = '';

        await Promise.all(subjects.map(subject => loadQuestionsForSubject(subject, year)));

        data.selectedSubjects = subjects;
        data.duration = duration;
        data.year = year;

        window.api.closeSelectSubjectWindow(data);
    }
}

async function loadQuestionsForSubject(subject, year) {
    try {
        const questions = await window.api.getQuestions(subject, year);
        // Check if no questions were returned.
        if (!questions || questions.length === 0) {
            const msg = `No questions found for subject: ${subject} (year: ${year}).`;
            console.error(msg);
            feedback.textContent = msg;

            // Throw an error so that the calling code knows to stop further processing.
            throw new Error(msg);
        } else {
            feedback.textContent = '';
        }

        data.subjects[subject] = {
            questions: questions,
            currentQuestionIndex: 0,
            userAnswers: [],
        };
    } catch (error) {
        console.error('Failed to load questions:', error);
    }
}
