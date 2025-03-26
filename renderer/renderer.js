const loadPage = require('./navigation.js');

document.addEventListener('DOMContentLoaded', () => {
    loadPage('home');

    const controlsContainer = document.getElementById('controls-container');
    const search = document.getElementById('search');
    const maximizeButton = document.getElementById("max-button");
    const maxIcon = document.getElementById('max')

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
            controlsContainer.classList.add('hidden');
            search.classList.add('hidden');
        }
    });

    window.api.showControls((_, isShow) => {
        console.log("I rannnn");
        if (isShow) {
            controlsContainer.classList.remove('hidden');
            search.classList.remove('hidden');
        }
    });
});
