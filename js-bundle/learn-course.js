(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
let currentLesson = 1;

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
},{}]},{},[1]);
