const slider = document.querySelector('.learning-slider');
const slides = document.querySelectorAll('.learning-slide');
const prevBtn = document.getElementById('learning-prevBtn');
const nextBtn = document.getElementById('learning-nextBtn');

let currentIndex = 0;
let autoSlideInterval;

function updateSliderPosition() {
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function slideToNext() {
    currentIndex = (currentIndex === slides.length - 1) ? 0 : currentIndex + 1;
    updateSliderPosition();
}

function slideToPrev() {
    currentIndex = (currentIndex === 0) ? slides.length - 1 : currentIndex - 1;
    updateSliderPosition();
}

function startAutoSlide() {
    autoSlideInterval = setInterval(slideToNext, 5000); // Slide every 5 seconds
}

function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

prevBtn.addEventListener('click', () => {
    stopAutoSlide();
    slideToPrev();
    startAutoSlide();
});

nextBtn.addEventListener('click', () => {
    stopAutoSlide();
    slideToNext();
    startAutoSlide();
});

// Start the automatic sliding
startAutoSlide();
