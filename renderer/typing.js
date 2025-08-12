document.querySelector('.btn-purple').addEventListener('click', function () {
    // Hide main content
    const mainContent = document.getElementById('typing-main-content');
    if (mainContent) mainContent.style.display = 'none';

    // Show loader
    const loader = document.getElementById('challenge-loader');
    if (loader) {
        loader.style.display = 'block';
        loader.style.position = 'fixed';
        loader.style.top = '50%';
        loader.style.left = '50%';
        loader.style.transform = 'translate(-50%, -50%)';
        loader.style.zIndex = '9999';

        // Optionally, hide loader after 10 seconds
        setTimeout(() => {
            loader.style.display = 'none';
            if (mainContent) mainContent.style.display = '';
        }, 10000);
    }

    // Load challenge in the same window
    window.api.loadChallenge();
});