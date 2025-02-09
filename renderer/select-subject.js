document.addEventListener("DOMContentLoaded", function () {
    const closeModalBtn = document.getElementById("close-button");
    const yearDropdown = document.getElementById("exam-year");
    const startBtn = document.getElementById("start-exam");

    closeModalBtn.addEventListener('click', () => {
        window.api.closeSelectSubjectWindow('home');
    });

    startBtn.addEventListener('click', () => {
        window.api.closeSelectSubjectWindow('exam');
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
