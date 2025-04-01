(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// export function loadPage(page) {
//     fetch(`pages/${page}.html`)
//         .then(response => response.text())
//         .then(html => {
//             const appDiv = document.getElementById('app');
//             appDiv.innerHTML = html;
//             const script = document.createElement('script');
//             script.type = 'module';
//             script.src = `renderer/${page}.js`;
//             document.body.appendChild(script);
//         })
//         .catch(err => console.error('Error loading page:', err));
// }

function loadPage(page) {
    const homeDiv = document.getElementById('home');
    const examDiv = document.getElementById('cbt');
    const summaryDiv = document.getElementById('summary');

    if (page === 'cbt') {
        homeDiv.classList.add('hidden');
        summaryDiv.classList.add('hidden');
        examDiv.classList.remove('hidden');
    } else if (page === 'home') {
        examDiv.classList.add('hidden');
        summaryDiv.classList.add('hidden');
        homeDiv.classList.remove('hidden');
    }else if(page === 'summary'){
        examDiv.classList.add('hidden');
        homeDiv.classList.add('hidden');
        summaryDiv.classList.remove('hidden');
    }
}

module.exports = loadPage;

},{}],2:[function(require,module,exports){
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

},{"./navigation.js":1}]},{},[2]);
