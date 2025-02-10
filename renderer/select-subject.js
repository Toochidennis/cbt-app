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
                //alert('You can select up to ' + maxSelection + ' subjects only.');
            }
        });
    });

    closeModalBtn.addEventListener('click', () => {
        window.api.closeSelectSubjectWindow('home');
    });

    startBtn.addEventListener('click', () => {
        const duration = getDuration();
        const subjects = getSelectedSubjects();

        const selectedData = {
            "subjects": subjects,
            "hour": duration['hour'],
            "minutes": duration['minutes'],
            "action": 'exam',
            "year": yearDropdown.value,
        };

        window.api.closeSelectSubjectWindow(selectedData);
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
    const hour = document.getElementById('hour').value;
    const minutes = document.getElementById('minutes').value;

    if (!hour && !minutes) {
        return { hour: 0, minutes: 0 };
    } else {
        return { hour: hour, minutes: minutes };
    }
}
