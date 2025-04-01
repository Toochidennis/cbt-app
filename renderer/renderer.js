const loadPage = require('./navigation.js');

document.addEventListener('DOMContentLoaded', () => {
    loadPage('home');

    const controlsContainer = document.getElementById('controls-container');
    const search = document.getElementById('search');
    const maximizeButton = document.getElementById("max-button");
    const maxIcon = document.getElementById('max')
    const timer = document.getElementById('timer')

    timer.style.display ='block'
    controlsContainer.style.display = 'none';
    search.style.display = 'none';

    document.getElementById("min-button").addEventListener("click", () => {
        window.api.minimize();
    });

    maximizeButton.addEventListener("click", () => {
        // window.api.maximize();
    });

    window.api.onMaximized(() => {
        maxIcon.srcset = "assets/icons/restore.svg"
    });

    window.api.onRestored(() => {
        maxIcon.srcset = "assets/icons/max.svg"
    });

    document.getElementById("close-button").addEventListener("click", () => {
        window.api.close();
    });

    window.api.hideControls((_, isHide) => {
        if (isHide) {
            controlsContainer.style.display = 'none';
            search.style.display = 'none';
            timer.style.display ='block'

        }
    });

    window.api.showControls((_, isShow) => {
        if (isShow) {
            controlsContainer.classList.remove('hidden');
            search.classList.remove('hidden');
        }
    });
});
