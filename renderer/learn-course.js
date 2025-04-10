const axios = require('axios');

let lessons = [];
let currentIndex = 0;

const courseName = localStorage.getItem('courseName');

// document.addEventListener('DOMContentLoaded', () => {
//     const savedCourseId = localStorage.getItem("selectedCourseId");
//     if (savedCourseId) {
//         console.log("Restored courseId from localStorage:", savedCourseId);
//         fetchLessons(savedCourseId);
//     }
// });

window.api.startLearning((_, courseId) => {
    localStorage.setItem("selectedCourseId", courseId);

    fetchLessons(courseId)
});

function showLoader() {
    const loaderContainer = document.createElement('div');
    loaderContainer.id = 'loader-container';
    const loader = document.createElement('div');
    loader.id = 'loader';

    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);

    loaderContainer.appendChild(loader);
    document.body.appendChild(loaderContainer);
}

function hideLoader() {
    const loaderContainer = document.getElementById('loader-container');
    if (loaderContainer) {
        loaderContainer.remove();
    }
}

function fetchLessons(courseId) {
    showLoader(); // Show loader before starting the request
    axios.get(`https://linkschoolonline.com/lessons?course_id=${courseId}`)
        .then(response => {
            console.log(response.data);
            lessons = response.data;
            populateLessons()
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            hideLoader(); // Hide loader after the request completes
        });
}

function populateLessons() {
    if (!lessons || lessons.length === 0) return;

    const savedIndex = localStorage.getItem("selectedLessonIndex");
    if (savedIndex !== null) {
        currentIndex = parseInt(savedIndex);
    }

    const lessonContainer = document.getElementById('lesson-list');
    lessonContainer.innerHTML = ''
    document.getElementById('course-title').textContent = courseName;

    lessons.forEach((lesson, index) => {
        const lessonList = document.createElement('li');
        const label = document.createElement('label');
        const span = document.createElement('span');

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'option';
        input.disabled = true;
        input.value = lesson.title;
        span.textContent = `${lesson.title}: ${lesson.description}`;

        label.append(input, span);
        lessonList.appendChild(label);

        lessonList.dataset.index = index;

        if (index === currentIndex) {
            lessonList.classList.add('active');
            input.checked = true;
        }

        lessonList.addEventListener('click', () => selectLesson(index, false));
        lessonContainer.appendChild(lessonList);
    });

    //   scrollToLesson(currentIndex);
    selectLesson(currentIndex, false);
}

function selectLesson(index, updateCheckbox = true) {
    currentIndex = index;
    localStorage.setItem("selectedLessonIndex", currentIndex);

    // Remove all highlights
    const allLessons = document.querySelectorAll('#lesson-list li');

    allLessons.forEach((li, i) => {
        const checkbox = li.querySelector('input');

        li.classList.toggle('active', i === index);

        if (updateCheckbox) {
            checkbox.checked = i === index;
        }
    });

    const selectedLesson = lessons[index];
    if (!selectedLesson?.content) return;

    const embedUrl = getEmbedUrl(selectedLesson.content.video_url);
    document.getElementById('lesson-video').src = embedUrl;

    document.getElementById('zoom-btn').onclick = () => {
        window.api.openLink(selectedLesson.content.zoom_url);
    };

    document.getElementById('take-test').onclick = () => {
        window.api.openQuizWindow(selectedLesson.content.quiz_url);
    };

    document.getElementById('content-title').innerHTML =
        `${selectedLesson.description} 
        <br><span>Digital Dreams ICT Academy</span>`;
}

function getEmbedUrl(youtubeUrl) {
    try {
        const url = new URL(youtubeUrl);
        let videoId = '';

        if (url.hostname === 'youtu.be') {
            videoId = url.pathname.slice(1);
        } else if (url.hostname.includes('youtube.com')) {
            videoId = url.searchParams.get('v');
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}` : youtubeUrl;
    } catch (e) {
        return '';
    }
}

// function scrollToLesson(index) {
//     const listItems = document.querySelectorAll('#lesson-list li');
//     const item = listItems[index];
//     if (item) {
//         item.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }
// }


document.getElementById('next-btn').addEventListener('click', () => {
    if (currentIndex < lessons.length - 1) {
        selectLesson(currentIndex + 1, true); // true = update checkbox
        // scrollToLesson(currentIndex);
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentIndex > 0) {
        selectLesson(currentIndex - 1, true);
        //scrollToLesson(currentIndex);
    }
});

document.getElementById('close-learn').addEventListener('click', () => {
    window.api.closeLearnCourseWindow();
});