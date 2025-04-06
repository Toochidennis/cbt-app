
const axios = require('axios')

axios.get('https://linkschoolonline.com/courses')
  .then(response => {
    console.log(response.data);
    populateCourses(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });

function populateCourses(courses) {
  if (!courses || courses.length === 0) {
    console.log("No courses available.");
    return;
  }

  const coursesContainer = document.getElementById('courses-container');
  coursesContainer.innerHTML = '';

  const fragment = document.createDocumentFragment();

  courses.forEach(course => {
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


    courseContent.append(courseTitle);
    courseContent.append(courseDescription);

    courseFooter.append(footerImage);
    courseFooter.append(footerText);
    courseFooter.append(takeCourseBtn);

    courseBox.append(courseImage);
    courseBox.append(courseCategory);
    courseBox.append(courseContent);
    courseBox.append(courseFooter);

    fragment.appendChild(courseBox);
  });

  coursesContainer.appendChild(fragment);
}