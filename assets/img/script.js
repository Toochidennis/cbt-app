function toggleDropdown(dropdownId, button) {
    const dropdownContent = document.getElementById(dropdownId);
    const isVisible = dropdownContent.style.display === 'flex';

    // Toggle the clicked dropdown content
    dropdownContent.style.display = isVisible ? 'none' : 'flex';

    // Toggle the arrow direction
    const arrow = button.querySelector('.dropdown-arrow');
    if (arrow) {
        arrow.classList.toggle('open', !isVisible);
    }
}

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

document.querySelector('.scrollable-content').addEventListener('scroll', function (e) {
    const videoContainer = document.querySelector('.video-container');
    const scrollableContent = e.target;

    if (scrollableContent.scrollTop === 0) {
        videoContainer.style.height = '100%'; // Reset to original height
    } else if (videoContainer.style.height !== '60%') {
        videoContainer.style.height = '60%'; // Shrink video height to 60%
        videoContainer.style.transition = 'height 0.3s ease'; // Smooth transition
        scrollableContent.scrollTop = 0; // Prevent scrolling until the height transition completes
        setTimeout(() => {
            scrollableContent.scrollTop = 1; // Allow scrolling after the transition
        }, 300); // Match the transition duration
    }
});