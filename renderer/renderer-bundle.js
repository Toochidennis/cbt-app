(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function loadPage(page) {
    const homeDiv = document.getElementById('home');
    const examDiv = document.getElementById('cbt');

    if (page === 'cbt') {
        homeDiv.classList.add('hidden');
        examDiv.classList.remove('hidden');
    } else if (page === 'home') {
        examDiv.classList.add('hidden');
        
        homeDiv.classList.remove('hidden');
    }
}

function switchPage(page, script) {
    fetch(`pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            return fetch(`renderer/${script}`); // Fetch the script content
        })
        .then(response => response.text())
        .then(jsCode => {
            eval(jsCode); // Execute the script manually
        })
        .catch(error => console.error("Error loading page/script:", error));
}

module.exports = {loadPage, switchPage}

},{}],2:[function(require,module,exports){
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
        switchPage('learn-courses', 'renderer-bundle.js');

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

},{"./navigation.js":1}]},{},[2]);
