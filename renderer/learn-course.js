const axios = require('axios');

let lessons = [];

const lessonContainer = document.getElementById('lesson-list');

document.addEventListener('DOMContentLoaded', () => {
    const savedCourseId = localStorage.getItem("selectedCourseId");
    if (savedCourseId) {
        console.log("Restored courseId from localStorage:", savedCourseId);
        fetchLessons(savedCourseId);
    }
});

window.api.startLearning((_, courseId) => {
    console.log("Course id ", courseId);
    localStorage.setItem("selectedCourseId", courseId);

    fetchLessons(courseId)
});

function fetchLessons(courseId) {
    axios.get(`https://linkschoolonline.com/lessons?course_id=${courseId}`)
        .then(response => {
            console.log(response.data);
            lessons = response.data;
            populateLessons()
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function populateLessons() {
    if (!lessons || lessons.length === 0) {
        return
    }

    lessonContainer.innerHTML = ''

    lessons.forEach((lesson, index) => {
        const lessonList = document.createElement('li');
        const label = document.createElement('label');
        const span = document.createElement('span');

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'option';
        input.value = lesson.title;
        span.textContent = lesson.title;

        lessonList.dataset.index = index;

        label.append(input, span);
        lessonList.appendChild(label);

        lessonList.addEventListener('click', () => selectLesson(index));
        lessonContainer.appendChild(lessonList);
    });
}

function selectLesson(index) {
    const selectedLesson = lessons[index];
    const content = selectedLesson.content

    if (!content) return;

    //const 


    const embedUrl = getEmbedUrl(content.video_url);
    document.getElementById('lesson-video').src = embedUrl;
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

        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } catch (e) {
        return '';
    }
}



document.getElementById('close-learn').addEventListener('click', () => {
    window.api.closeLearnCourseWindow();
});