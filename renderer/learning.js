const axios = require('axios');

const bannerColors = [
  "#426CFF", // Bright Blue
  "#5A8DEE", // Soft Blue
  "#6C63FF", // Purple-Blue
  "#1E90FF", // Dodger Blue
  "#4682B4", // Steel Blue
];


function showShimmer() {
  const coursesContainer = document.getElementById('courses-container');
  coursesContainer.innerHTML = '';
  coursesContainer.style.display = 'grid';
  coursesContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
  coursesContainer.style.gap = '20px';

  for (let i = 0; i < 4; i++) {
    const shimmerBox = document.createElement('div');
    shimmerBox.classList.add('shimmer-box');
    shimmerBox.style.height = '150px';
    shimmerBox.style.borderRadius = '10px';

    coursesContainer.appendChild(shimmerBox);
  }
}

function hideShimmer() {
  const coursesContainer = document.getElementById('courses-container');
  coursesContainer.innerHTML = '';
}

function showError(message) {
  const coursesContainer = document.getElementById('courses-container');
  coursesContainer.innerHTML = '';

  const errorBox = document.createElement('div');
  errorBox.classList.add('error-box');

  const errorIcon = document.createElement('div');
  errorIcon.classList.add('error-icon');
  errorIcon.textContent = '⚠️';

  const errorMessage = document.createElement('p');
  errorMessage.textContent = message;

  errorBox.appendChild(errorIcon);
  errorBox.appendChild(errorMessage);

  coursesContainer.appendChild(errorBox);
}

axios.get('https://linkschoolonline.com/courses')
  .then(response => {
    hideShimmer();
    console.log(response.data);
    populateCourses(response.data);
  })
  .catch(error => {
    hideShimmer();
    if (!navigator.onLine) {
      showError('Unable to connect. Please check your internet connection and try again.');
    } else {
      showError('An error occurred while fetching courses. Please try again later.');
    }
    console.error('Error:', error);
  });

showShimmer();

function populateCourses(courses) {
  if (!courses || courses.length === 0) {
    console.log("No courses available.");
    return;
  }

  const bannerContainer = document.getElementById('banner-container');
  const coursesContainer = document.getElementById('courses-container');
  coursesContainer.innerHTML = '';
  bannerContainer.innerHTML = '';

  const fragment = document.createDocumentFragment();
  const bannerFragment = document.createDocumentFragment();

  courses.forEach((course, index) => {
    // Create elements dynamically
    const courseBox = document.createElement('div');
    const courseCategory = document.createElement('div');
    const courseImage = document.createElement('img');
    const courseContent = document.createElement('div');
    const courseTitle = document.createElement('p');
    const courseDescription = document.createElement('p');
    const courseFooter = document.createElement('div');
    const footerImage = document.createElement('img');
    const footerText = document.createElement('p');
    const takeCourseBtn = document.createElement('button');

    // Add them classes
    courseBox.classList.add('course-box');
    courseCategory.classList.add('course-label');
    courseContent.classList.add('course-content');
    courseTitle.classList.add('course-title-text');
    courseDescription.classList.add('course-description');
    courseFooter.classList.add('course-footer');

    // populate the elements with content
    courseImage.src = course.image_url;
    courseImage.alt = "Course Image"
    courseCategory.textContent = course.category;
    courseTitle.textContent = course.course_name;
    courseDescription.textContent = course.description;
    footerImage.src = "assets/img/image 85.png"
    footerImage.alt = "Course Footer Image"
    footerText.innerHTML = `Easter Kids Coding Fest <br> Powered By Digital Dreams`;
    takeCourseBtn.textContent = "Take Course";

    takeCourseBtn.onclick = () =>{
      e.stopPropagation(); 
      startLearning(course)
    };

    courseContent.append(courseTitle, courseDescription);
    courseFooter.append(footerImage, footerText, takeCourseBtn);
    courseBox.append(courseImage, courseCategory, courseContent, courseFooter);

    courseBox.onclick = () =>{
      startLearning(course)
    };

    bannerFragment.appendChild(populateCarousel(course, bannerColors[index]));
    fragment.appendChild(courseBox);
  });

  bannerContainer.appendChild(bannerFragment);
  coursesContainer.appendChild(fragment);
}

function populateCarousel(course, color) {
  const banner = document.createElement('div');
  const bannerContent = document.createElement('div');
  const bannerTitle = document.createElement('p');
  const bannerSlogan = document.createElement('span');
  const takeCourseBtn = document.createElement('button');
  const courseIcon = document.createElement('img');

  // Assign them classes
  banner.classList.add('banner');
  bannerContent.classList.add('banner-content');

  // assign values
  bannerTitle.textContent = course.course_name;
  bannerSlogan.textContent = course.slogan;
  courseIcon.src = course.icon;
  takeCourseBtn.innerHTML = `Take Course <img src="assets/img/play.png" alt="Play icon">`;

  takeCourseBtn.onclick = () =>{
    e.stopPropagation(); 
    startLearning(course)
  };

  bannerContent.append(bannerTitle, bannerSlogan, takeCourseBtn);
  banner.append(bannerContent, courseIcon);
  banner.style.backgroundColor = color;

  banner.onclick = () =>{
    startLearning(course)
  };

  return banner;
}

const startLearning = (course) => {
  window.api.openLearnCourseWindow();
  localStorage.setItem('courseData',
    JSON.stringify(
      {
        courseId: course.id,
        courseName: course.course_name
      })
  );
}