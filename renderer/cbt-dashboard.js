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

    festBtn.addEventListener('click', () => {
        window.api.openLink('https://forms.gle/wMh3PcgVNCfo1E229');
    });

    bootCampBtn.addEventListener('click', () => {
        window.api.openLink('https://forms.gle/teJJV3W7nqkYC2qe8');
    });

    challengeBtn.addEventListener('click', () => {
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


// Show exam screen when subjects selection window is closed
window.api.onSecondWindowClosed((_, data) => {
    if (data.action === 'cbt') {
        state.subjects = data.subjects;
        state.duration = data.duration;
        state.selectedSubjects = data.selectedSubjects;
        state.year = data.year;

        init();

    }
});

