const { switchPage }  = require( "./navigation.js");

document.addEventListener('DOMContentLoaded', () => {
    switchPage("cbt-dashboard", "index-bundle.js");

    const controlsContainer = document.getElementById('controls-container');
    const search = document.getElementById('search');
    const maximizeButton = document.getElementById("max-button");
    const maxIcon = document.getElementById('max')
    const cbtBtn = document.getElementById('cbt-btn')
    const typingBtn = document.getElementById('typing-btn')
    const learnBtn = document.getElementById('learn-btn')

    cbtBtn.addEventListener('click', ()=>{
        switchPage("cbt-dashboard", "index-bundle.js");
    });

    typingBtn.addEventListener('click', ()=>{
        switchPage('key-buddy', 'key-buddy-bundle.js');
    });

    learnBtn.addEventListener('click', ()=>{
        switchPage('learn-courses', 'learn-courses-bundle.js');

    });

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
        if (isShow) {
            controlsContainer.classList.remove('hidden');
            search.classList.remove('hidden');
        }
    });
});
