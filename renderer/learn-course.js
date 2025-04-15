const axios = require('axios');
const Chart = require('chart.js/auto');

let lessons = [];
let currentIndex = 0;
let pointsChart = null;

const { courseId, courseName, email } = JSON.parse(localStorage.getItem('courseData'));


document.addEventListener('DOMContentLoaded', () => {
    // const savedCourseId = localStorage.getItem("selectedCourseId");
    if (courseId) {
        console.log("Restored courseId from localStorage:", courseId);
        fetchLessons(courseId);
    }
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

    const completedLessons = getCompletedLessons();
    const savedIndex = localStorage.getItem("selectedLessonIndex");

    if (completedLessons.length < lessons.length) {
        // Load the first incomplete lesson
        for (let i = 0; i < lessons.length; i++) {
            if (!completedLessons.includes(i)) {
                currentIndex = i;
                break;
            }
        }
    } else if (savedIndex !== null) {
        // If all completed, fallback to last viewed
        currentIndex = parseInt(savedIndex);
    } else {
        // Default to first lesson
        currentIndex = 0;
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
        }

        if (completedLessons.includes(index)) {
            input.checked = true;
        }

        lessonList.addEventListener('click', () => selectLesson(index));
        lessonContainer.appendChild(lessonList);
    });

    //   scrollToLesson(currentIndex);
    selectLesson(currentIndex);
}

function selectLesson(index) {
    currentIndex = index;
    localStorage.setItem("selectedLessonIndex", currentIndex);

    // Remove all highlights
    const completedLessons = getCompletedLessons();
    const allLessons = document.querySelectorAll('#lesson-list li');

    allLessons.forEach((li, i) => {
        const checkbox = li.querySelector('input');
        li.classList.toggle('active', i === index);

        checkbox.checked = completedLessons.includes(i);
    });

    const selectedLesson = lessons[index];
    if (!selectedLesson?.content) return;

    const embedUrl = getEmbedUrl(selectedLesson.content.video_url);
    document.getElementById('lesson-video').src = embedUrl;
    setZoomInfo(selectedLesson.content);

    takeQuiz(selectedLesson.content, 'take-test', courseId, index + 1);
    takeQuiz(selectedLesson.content, 'second-quiz-btn', courseId, index + 1);

    document.getElementById('content-title').innerHTML =
        `${selectedLesson.description} 
        <br><span>Digital Dreams ICT Academy</span>`;

    document.getElementById('recorded-video').src = selectedLesson.content.recorded_url;

    document.getElementById('assignment-download').onclick = () => {
        if (selectedLesson.assignment_url) {
            downloadFile(selectedLesson.assignment_url);
        }else{
            alert("There is no assignment for this material");
        }
    };

    document.getElementById('material-download').onclick = () => {
        if (selectedLesson.material_url) {
            downloadFile(selectedLesson.material_url);
        }else{
            alert("Not material for this lesson yet");
        }
    };
}

function setZoomInfo(content) {
    // Convert server date to Date object
    const classDateTime = new Date(content.date.replace(" ", "T")); // Ensure ISO format
    const classStartTime = new Date(classDateTime);
    classStartTime.setHours(10, 0, 0, 0); // 10:00 AM

    const classEndTime = new Date(classDateTime);
    classEndTime.setHours(12, 0, 0, 0); // 12:00 PM

    const now = new Date();

    let zoomInfoText = "";
    if (now < classStartTime) {
        // Before class
        const options = {
            weekday: "long",
            month: "long",
            day: "numeric",
        };
        const readableDate = classStartTime.toLocaleDateString("en-US", options);
        zoomInfoText = `Your Zoom class starts on <strong>${readableDate}</strong> from <strong>10:00 AM to 12:00 PM</strong>.`;
    } else if (now >= classStartTime && now <= classEndTime) {
        // During class
        zoomInfoText = `<strong>Your Zoom class is currently ongoing (10:00 AM to 12:00 PM).</strong>`;
    } else {
        // After class
        zoomInfoText = `<strong>Your Zoom class has ended. You can now watch the recorded video.</strong>`;
    }

    document.getElementById('zoom-info').innerHTML = zoomInfoText;

    // Update button
    const zoomBtn = document.getElementById('zoom-btn');
    if (now > classEndTime) {
        zoomBtn.textContent = "Watch Recorded Video";
        zoomBtn.onclick = () => {
            window.open(content.recorded_url);
        };
    } else {
        zoomBtn.textContent = "Join Zoom Class";
        zoomBtn.onclick = () => {
            window.api.openLink(content.zoom_url);
        };
    }
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
        const nextIndex = currentIndex + 1;
        saveCompletedLesson(currentIndex);
        selectLesson(nextIndex); // true = update checkbox
        // scrollToLesson(currentIndex);
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentIndex > 0) {
        selectLesson(currentIndex - 1);
        //scrollToLesson(currentIndex);
    }
});

function getCompletedLessons() {
    const stored = localStorage.getItem("completedLessons");
    return stored ? JSON.parse(stored) : [];
}

function saveCompletedLesson(index) {
    const completed = getCompletedLessons();
    if (!completed.includes(index)) {
        completed.push(index);
        localStorage.setItem("completedLessons", JSON.stringify(completed));
    }
}

document.getElementById('close-learn').addEventListener('click', () => {
    window.api.closeLearnCourseWindow();
});

const takeQuiz = (content, viewId, courseId, lessonId) => {
    const quizBtn = document.getElementById(viewId);
    const assessment = JSON.parse(localStorage.getItem(`quiz_${courseId}_${lessonId}`) || '[]');

    quizBtn.textContent = assessment.length === 0 ? 'Take Quiz' : 'Retake Quiz';

    console.log('assessment ', assessment);

    plotPointsChart(assessment.quizScore || 0, assessment.maxScore || 100);

    if (!content) return;

    quizBtn.onclick = () => {
        if (content.quiz_url === 1) {
            window.api.openQuizWindow();

            localStorage.setItem('quizData',
                JSON.stringify(
                    {
                        courseId,
                        lessonId
                    })
            );
        } else {
            alert('There is no quiz for the lesson yet');
        }
    };
};

window.api.onLessonQuizEnded((_, lessonId) => {
    fetchLessons(courseId);
   // takeQuiz([], 'take-test', courseId, lessonId);
   // takeQuiz([], 'second-quiz-btn', courseId, lessonId);
});

function plotPointsChart(score, maxScore) {
    const assessmentCanvas = document.getElementById('assessment-chart').getContext('2d');
    document.getElementById('user-score').textContent = `${score}/${maxScore}`

    if (pointsChart) {
        pointsChart.destroy();
    }

    pointsChart = new Chart(assessmentCanvas, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [score, maxScore],
                backgroundColor: [
                    'rgba(252, 147, 56, 1)', 'rgba(255, 235, 217, 1)'
                ]
            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false,
            cutout: '60%',
            borderWidth: 0,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            }
        }
    });
}



const modal = document.getElementById('assignment-modal');
const submitBtn = document.getElementById('assignment-submit');
const sendMailBtn = document.getElementById('send-mail');
const cancelBtn = document.getElementById('cancel-mail');
const nameInput = document.getElementById('student-name');

// Show modal on button click
submitBtn.addEventListener('click', () => {
    nameInput.value = '';
    modal.style.display = 'flex';
});

// Cancel button
cancelBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Send email
sendMailBtn.addEventListener('click', () => {
    const fullName = nameInput.value.trim();

    if (!fullName) {
        alert('Please enter your full name.');
        return;
    }

    const subject = encodeURIComponent('Assignment Submission');
    const body = encodeURIComponent(
        `Hi,\n\nMy name is ${fullName}, and I am submitting my assignment.\n\nPlease find the file attached.\n\nThank you.`
    );

    const mail = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}.`;
    window.api.openLink(mail);

    modal.style.display = 'none';
});


function downloadFile(url, lessonTitle) {
   
    const anchor = document.createElement('a');
    anchor.href = url;

    const fileName = url.split('/').pop().split('?')[0];

    anchor.download = fileName || `${lessonTitle}-material`;
    //anchor.target = '_blank'; 
    anchor.click();
}
