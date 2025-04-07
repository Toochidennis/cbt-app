const { switchPage }  = require( "./navigation");

document.addEventListener('DOMContentLoaded', () => {
    const controlsContainer = document.getElementById('controls-container');
    const search = document.getElementById('search');
    const maximizeButton = document.getElementById("max-button");
    const maxIcon = document.getElementById('max')
    const cbtBtn = document.getElementById('cbt-btn')
    const typingBtn = document.getElementById('typing-btn')
    const learnBtn = document.getElementById('learn-btn')

    switchPage("cbt-dashboard");

    cbtBtn.addEventListener('click', ()=>{
        switchPage("cbt-dashboard");
    });

    typingBtn.addEventListener('click', ()=>{
        switchPage('key-buddy');
    });

    learnBtn.addEventListener('click', ()=>{
        switchPage('learning');

    });

    document.getElementById("min-button").addEventListener("click", () => {
        window.api.minimize();
    });

    maximizeButton.addEventListener("click", () => {
        window.api.maximize();
    });

    window.api.onMaximized(() => {
        maxIcon.srcset = "assets/img/restore-down.png"
    });

    window.api.onRestored(() => {
        maxIcon.srcset = "assets/img/maximize2.png"
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
