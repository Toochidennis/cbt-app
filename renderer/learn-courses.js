const switchPage =  require( "./navigation.js");

// document.getElementById('join-now').addEventListener('click', ()=>{
//     switchPage('learn-courses', 'learn-courses-bundle.js');
// });

function toggleDropdown(dropdownId, button) {
    const dropdownContent = document.getElementById(dropdownId);
    if (!dropdownContent) {
        console.error(`Dropdown content with ID "${dropdownId}" not found.`);
        return;
    }

    const isVisible = dropdownContent.style.display === 'flex';

    // Toggle the clicked dropdown content
    dropdownContent.style.display = isVisible ? 'none' : 'flex';

    // Toggle the arrow direction
    const arrow = button.querySelector('.dropdown-arrow');
    if (arrow) {
        arrow.classList.toggle('open', !isVisible);
    }
}

// Ensure all dropdown contents are initially hidden
document.querySelectorAll('.dropdown-content').forEach(content => {
    content.style.display = 'none';
});

function handleCheckboxChange(checkbox) {
    if (checkbox.checked) {
        console.log(`${checkbox.value} selected`);
    } else {
        console.log(`${checkbox.value} deselected`);
    }
}

let scrollTimeout;

function handleScroll(container) {
    container.classList.remove('hide-scrollbar'); // Show scrollbar on scroll
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        container.classList.add('hide-scrollbar'); // Hide scrollbar after 2 seconds
    }, 2000);
}

document.querySelectorAll('.main-content, .mid-content, .dropdown-container').forEach(container => {
    container.addEventListener('scroll', () => handleScroll(container));
});

document.querySelector('.mid-content').addEventListener('scroll', function () {
    const videoContainer = document.querySelector('.video-container');
    const scrollTop = this.scrollTop;

    if (scrollTop > 0) {
        videoContainer.style.height = '60%'; // Shrink video height to 60%
        videoContainer.style.transition = 'height 0.3s ease'; // Smooth transition
    } else {
        videoContainer.style.height = '100%'; // Reset to original height
    }
});

document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', function () {
        if (this.checked) {
            console.log(`${this.value} selected`);
        } else {
            console.log(`${this.value} deselected`);
        }
    });
});

// Add event listeners for dropdown buttons
document.querySelectorAll('.dropdown button').forEach(button => {
    console.log("hello");
    button.addEventListener('click', function () {
        const dropdownId = this.getAttribute('id').replace('Button', 'Content');
        toggleDropdown(dropdownId, this);
    });
});

