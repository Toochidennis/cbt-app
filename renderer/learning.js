const axios = require('axios');

const bannerColors = [
  "#426CFF", // Bright Blue
  "#5A8DEE", // Soft Blue
  "#6C63FF", // Purple-Blue
  "#1E90FF", // Dodger Blue
  "#4682B4", // Steel Blue
];

const categoryColors = ['#f3ecda', '#EBE3FF', '#E7E7E7'];
const categoriesImg = [
  'assets/img/code-lab.svg',
  'assets/img/easter-cat.svg',
  'assets/img/kids-camp.svg',
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

showShimmer();

axios.get('https://linkschoolonline.com/categories')
  .then(response => {
    populateCategories(response.data);
    fetchCourses({ name: 'Kids Weekend CodeLab', id: 1, free: 0 });
  })
  .catch(error => {
    if (!navigator.onLine) {
      showError('Unable to connect. Please check your internet connection and try again.');
    } else {
      showError('An error occurred while fetching courses. Please try again later.');
    }
    console.error('Error:', error);
  })

function populateCategories(categories) {
  if (!categories) {
    return;
  }

  const categoriesDiv = document.querySelector('.categories');
  categoriesDiv.innerHTML = '';
  const categoriesFragment = document.createDocumentFragment();

  categories.forEach((category, i) => {
    const catBox = document.createElement('div');
    const img = document.createElement('img');
    const catContent = document.createElement('div');
    const nameDiv = document.createElement('p');
    const span = document.createElement('span');
    const soonDiv = document.createElement('div');

    //Assign classes
    catBox.classList.add('cat-box');
    catContent.classList.add('cat-text');
    soonDiv.classList.add('coming-banner');

    img.src = categoriesImg[i];
    nameDiv.textContent = category.name;
    span.textContent = `${category.courses} courses available`;

    soonDiv.textContent = category.free === 1 ? 'Free' : 'Paid';

    if (category.available === 0) {
      soonDiv.textContent = 'Coming Soon';
    }

    catContent.append(nameDiv, span);
    catBox.append(img, catContent, soonDiv);
    catBox.style.backgroundColor = categoryColors[i];

    categoriesFragment.appendChild(catBox);
  });

  categoriesDiv.appendChild(categoriesFragment);

  const catBoxes = document.querySelectorAll('.cat-box');
  catBoxes[0].classList.add('active');

  catBoxes.forEach((box, i) => {
    box.addEventListener('click', () => {
      catBoxes.forEach(el => el.classList.remove('active'));
      box.classList.add('active');

      if (i === catBoxes.length - 1) return;

      showShimmer()
      fetchCourses(categories[i]);
    });
  });
}

function fetchCourses(selectedCategory) {
  axios.get('https://linkschoolonline.com/courses')
    .then(response => {
      hideShimmer();
      console.log(response.data);
      populateCourses(response.data, selectedCategory);
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
}


function populateCourses(courses, category) {
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
    footerText.innerHTML = `${category.name} <br> Powered By Digital Dreams`;
    takeCourseBtn.textContent = "Take Course";

    takeCourseBtn.onclick = () => {
      e.stopPropagation();
      startLearning(course)
    };

    courseContent.append(courseTitle, courseDescription);
    courseFooter.append(footerImage, footerText, takeCourseBtn);
    courseBox.append(courseImage, courseCategory, courseContent, courseFooter);

    courseBox.onclick = () => {
      startLearning(course, category);
    };

    bannerFragment.appendChild(
      populateCarousel(course, bannerColors[index], category)
    );
    fragment.appendChild(courseBox);
  });

  bannerContainer.appendChild(bannerFragment);
  coursesContainer.appendChild(fragment);
}

function populateCarousel(course, color, category) {
  const banner = document.createElement('div');
  const bannerContent = document.createElement('div');
  const bannerTitle = document.createElement('p');
  const bannerSlogan = document.createElement('span');
  const bannerCategory = document.createElement('span');
  const takeCourseBtn = document.createElement('button');
  const courseIcon = document.createElement('img');

  // Assign them classes
  banner.classList.add('banner');
  bannerContent.classList.add('banner-content');

  // assign values
  bannerTitle.textContent = course.course_name;
  bannerSlogan.textContent = course.slogan;
  bannerCategory.textContent = category.name;
  courseIcon.src = course.icon;
  takeCourseBtn.innerHTML = `Take Course <img src="assets/img/play.png" alt="Play icon">`;

  takeCourseBtn.onclick = () => {
    e.stopPropagation();
    startLearning(course)
  };

  bannerContent.append(bannerTitle, bannerSlogan, bannerCategory, takeCourseBtn);
  banner.append(bannerContent, courseIcon);
  banner.style.backgroundColor = color;

  banner.onclick = () => {
    startLearning(course, category);
  };

  return banner;
}

const startLearning = (course, category) => {
  window.api.openLearnCourseWindow();
  localStorage.setItem('courseData',
    JSON.stringify(
      {
        courseId: course.id,
        courseName: course.course_name,
        email: course.email
      })
  );

  localStorage.setItem('category',
    JSON.stringify({ id: category.id, isFree: category.free })
  );
}