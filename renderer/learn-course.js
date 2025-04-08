let currentLesson = 1;

window.api.startLearning((_,courseId)=>{
    console.log("Course id ", courseId);
});

function selectLesson(lesson) {
    if (lesson === currentLesson + 1) {
        currentLesson = lesson;
        updateLessonStatus();
        showLessonContent();
    } else {
        alert("You must complete the previous lesson first.");
    }
}

function navigateLesson(direction) {
    const totalLessons = 4;
    if (direction === 'next' && currentLesson < totalLessons) {
        currentLesson++;
    } else if (direction === 'previous' && currentLesson > 1) {
        currentLesson--;
    }
    updateLessonStatus();
    showLessonContent();
}

function updateLessonStatus() {
    for (let i = 1; i <= 4; i++) {
        const lessonInput = document.querySelector(`input[name="lesson"][value="${i}"]`);
        lessonInput.checked = i < currentLesson; // Check all lessons before the current one
    }
}

function showLessonContent() {
    // Logic to display content for the current lesson
    console.log(`Displaying content for Lesson ${currentLesson}`);
    // Add your content-switching logic here
}

// Initialize the first lesson as selected
updateLessonStatus();
showLessonContent();

window.navigateLesson = navigateLesson;
window.selectLesson = selectLesson;

document.getElementById('close-learn').addEventListener('click', () => {
    window.api.closeLearnCourseWindow();
});