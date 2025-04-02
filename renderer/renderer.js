const loadPage = require('./navigation.js');

document.addEventListener('DOMContentLoaded', () => {
    loadPage('home');

    const devDrag = document.getElementById('div-drag');
    const maximizeButton = document.getElementById("max-button");
    const maxIcon = document.getElementById('max')
    const timer = document.getElementById('div-timer')

    timer.style.display = 'none';

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
            devDrag.classList.add('hidden')
            timer.style.display ='block';
        }
    });

    window.api.showControls((_, isShow) => {
        if (isShow) {
            devDrag.classList.remove('hidden');
            timer.style.display ='none';
            
        }
    });
});
