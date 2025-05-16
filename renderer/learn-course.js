const axios = require('axios');
const Chart = require('chart.js/auto');
const {showLoading, hideLoading, checkAndShowModal} = require('./course-activation');
let lessons = [];
let currentIndex = 0;
let pointsChart = null;

const templates = {
    1: '../assets/img/scratch-cert.svg',
    2: '../assets/img/graphic-cert.svg',
    3: '../assets/img/web-cert.svg'
};

const certModal = document.getElementById('certificate-modal');
const downloadCertBtn = document.getElementById('download-cert');
const cancelCertBtn = document.getElementById('cancel-cert');
const certNameInput = document.getElementById('cert-name');
const modal = document.getElementById('assignment-modal');
const submitBtn = document.getElementById('assignment-submit');
const sendMailBtn = document.getElementById('send-mail');
const cancelBtn = document.getElementById('cancel-mail');
const nameInput = document.getElementById('student-name');
const finalQuizBtn = document.getElementById('final-quiz');
const certTemplate = document.getElementById('cert-template');

const QUIZ_KEY_PREFIX = 'quiz_';

const { courseId, courseName, email } = JSON.parse(localStorage.getItem('courseData'));

// === Utility Functions ===
const getQuizKey = (courseId, lessonId) => `${QUIZ_KEY_PREFIX}${courseId}_${lessonId}`;

const getAssessmentData = (courseId, lessonId) =>
    JSON.parse(localStorage.getItem(getQuizKey(courseId, lessonId)) || '[]');

const setQuizData = (courseId, lessonId) => {
    localStorage.setItem('quizData', JSON.stringify({ courseId, lessonId }));
};

document.addEventListener('DOMContentLoaded', () => {
    certTemplate.src = templates[courseId];
    if (courseId) {
        console.log("Restored courseId from localStorage:", courseId);
        fetchLessons(courseId);
    }
});

function fetchLessons(courseId) {
    showLoading(); // Show loader before starting the request
    axios.get(`https://linkschoolonline.com/lessons?course_id=${courseId}`)
        .then(response => {
            // console.log(response.data);
            lessons = response.data;
            populateLessons()
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            hideLoading(); // Hide loader after the request completes
        });
}

function populateLessons() {
    if (!lessons.length) return;

    const completedLessons = getCompletedLessons();
    const savedIndex = parseInt(localStorage.getItem("selectedLessonIndex"));

    currentIndex = (completedLessons.length < lessons.length)
        ? lessons.findIndex((_, i) => !completedLessons.includes(i))
        : (!isNaN(savedIndex) ? savedIndex : 0);

    const lessonContainer = document.getElementById('lesson-list');
    lessonContainer.innerHTML = ''
    document.getElementById('course-title').textContent = courseName;

    lessons.forEach((lesson, index) => {
        const li = document.createElement('li');
        li.dataset.index = index;
        li.classList.toggle('active', index === currentIndex);

        const input = document.createElement('input');
        input.type = 'checkbox';
        input.name = 'option';
        input.disabled = true;
        input.checked = completedLessons.includes(index);

        const span = document.createElement('span');
        span.textContent = `${lesson.title}: ${lesson.description}`;

        const label = document.createElement('label');
        label.append(input, span);
        li.appendChild(label);

        li.addEventListener('click', () => selectLesson(index));
        lessonContainer.appendChild(li);
    });

    selectLesson(currentIndex); 
}

function selectLesson(index) {
    checkAndShowModal();

    currentIndex = index;
    localStorage.setItem("selectedLessonIndex", currentIndex);

    const selectedLesson = lessons[index];
    if (!selectedLesson?.content) return;

    updateLessonHighlight(index);
    localStorage.setItem('lessonTitle', selectedLesson.title);

    if (selectedLesson.content.reading_url == 1) {
        return handleCongratsContent(index, selectedLesson);
    }

    toggleSectionVisibility(true);

    const embedUrl = getEmbedUrl(selectedLesson.content.video_url);
    document.getElementById('lesson-video').src = embedUrl;
    document.getElementById('recorded-video').src = getEmbedUrl(selectedLesson.content.recorded_url);
    document.getElementById('content-title').innerHTML =
        `${selectedLesson.description} 
        <br><span>Digital Dreams ICT Academy</span>`;

    setZoomInfo(selectedLesson.content);
    setupDownloadButton('assignment-download', selectedLesson.assignment_url, 'No assignment for this material');
    setupDownloadButton('material-download', selectedLesson.material_url, 'No material for this lesson yet');

    takeQuiz(selectedLesson.content, 'take-test', courseId, index + 1);
    takeQuiz(selectedLesson.content, 'second-quiz-btn', courseId, index + 1);
}

function handleCongratsContent(index, lesson) {
    toggleSectionVisibility(false);
    updateLessonHighlight(index);

    const finalVideo = document.getElementById('final-video');
    const congratsVideoSection = document.getElementById('congrats-video');
    if (lesson.content.video_url) {
        finalVideo.src = getEmbedUrl(lesson.content.video_url);
        congratsVideoSection.style.display = 'block';
    } else {
        congratsVideoSection.style.display = 'none';
    }

    document.getElementById('congrats-text').textContent = lesson.goal;
    document.getElementById('content-title-2').textContent = lesson.description;

    const assessment = getAssessmentData(courseId, index);
    const isFinalQuiz = localStorage.getItem('isFinalQuiz') === '1';
    const secondQuizBtn = document.getElementById('second-quiz-btn');

    finalQuizBtn.onclick = null;
    secondQuizBtn.onclick = null;

    if (isFinalQuiz && assessment.length !== 0 && assessment.quizScore >= 50) {
        finalQuizBtn.textContent = 'Download Certificate';
        finalQuizBtn.onclick = showCertificateModal;
        secondQuizBtn.onclick = showCertificateModal;
    } else {
        finalQuizBtn.textContent = 'Take Quiz';
        finalQuizBtn.onclick = () => takeFinalQuiz(courseId, index, lesson.content);
        secondQuizBtn.onclick = () => takeFinalQuiz(courseId, index, lesson.content);
    }

    plotPointsChart(assessment.quizScore || 0, assessment.maxScore || 100);
}

function toggleSectionVisibility(isLesson) {
    document.getElementById('submit-assignment').style.display = isLesson ? 'block' : 'none';
    document.getElementById('first-section').style.display = isLesson ? 'block' : 'none';
    document.getElementById('second-section').style.display = isLesson ? 'none' : 'block';
    document.querySelector('.watch-lecture').style.display = isLesson ? 'block' : 'none';
}

function updateLessonHighlight(index) {
    const completedLessons = getCompletedLessons();
    const allLessons = document.querySelectorAll('#lesson-list li');
    allLessons.forEach((li, i) => {
        const checkbox = li.querySelector('input');
        li.classList.toggle('active', i === index);
        checkbox.checked = completedLessons.includes(i);
    });
}

function setupDownloadButton(buttonId, fileUrl, fallbackMessage) {
    const btn = document.getElementById(buttonId);
    btn.onclick = () => {
        if (fileUrl) {
            downloadFile(fileUrl);
        } else {
            alert(fallbackMessage);
        }
    };
}

cancelCertBtn.addEventListener('click', () => {
    certModal.style.display = 'none';
});

const showCertificateModal = () => {
    certNameInput.value = '';
    certModal.style.display = 'flex';

    downloadCertBtn.onclick = async () => {
        const fullName = certNameInput.value.trim();
        if (!fullName) return;

        downloadCertBtn.disabled = true;
        downloadCertBtn.textContent = "Generating Certificate...";
        downloadCertBtn.style.cursor = 'not-allowed';

        try {
            const filePath = await window.api.generatePDF(fullName, courseId, courseName);
            console.log("Certificate saved at:", filePath);
        } catch (err) {
            console.error("Error generating certificate:", err);
        } finally {
            downloadCertBtn.disabled = false;
            downloadCertBtn.textContent = "Download Certificate";
            downloadCertBtn.style.cursor = 'pointer';
            certNameInput.value = "";
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

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentIndex < lessons.length - 1) {
        const nextIndex = currentIndex + 1;
        saveCompletedLesson(currentIndex);
        selectLesson(nextIndex);
    }
});

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentIndex > 0) {
        selectLesson(currentIndex - 1);
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

const openQuiz = (courseId, lessonId, isFinal = false) => {
    if (isFinal) localStorage.setItem('isFinalQuiz', '1');
    else localStorage.setItem('isFinalQuiz', '0');

    window.api.openQuizWindow();
    setQuizData(courseId, lessonId);
};

const showNoQuizAlert = () => alert('There is no quiz for the lesson yet');

const updateQuizButtonText = (button, assessment) => {
    button.textContent = assessment.length === 0 ? 'Take Quiz' : 'Retake Quiz';
};

const takeQuiz = (content, viewId, courseId, lessonId) => {
    checkAndShowModal();

    const quizBtn = document.getElementById(viewId);
    if (!quizBtn) return;

    const assessment = getAssessmentData(courseId, lessonId);
    updateQuizButtonText(quizBtn, assessment);
    plotPointsChart(assessment.quizScore || 0, assessment.maxScore || 100);

    if (!content) return;

    quizBtn.onclick = () => {
        content.quiz_url === 1
            ? openQuiz(courseId, lessonId)
            : showNoQuizAlert();
    };
};

const takeFinalQuiz = (courseId, lessonId, content) => {
    checkAndShowModal();
    
    content.quiz_url === 1
        ? openQuiz(courseId, lessonId, true)
        : showNoQuizAlert();
}

window.api.onLessonQuizEnded((_, lessonId) => {
    fetchLessons(courseId);

    const assessment = getAssessmentData(courseId, lessonId);
    const isFinalQuiz = localStorage.getItem('isFinalQuiz') === '1';

    if (isFinalQuiz && assessment.length !== 0 && assessment.quizScore >= 50) {
        finalQuizBtn.textContent = 'Download Certificate';
        showCertificateModal();
        finalQuizBtn.onclick = showCertificateModal
    }
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
    const lessonTitle = localStorage.getItem('lessonTitle');

    if (!fullName) return;

    const subject = encodeURIComponent(`Assignment Submission for ${courseName} - ${lessonTitle}`);
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
    anchor.click();
}
