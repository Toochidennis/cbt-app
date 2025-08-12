(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}]},{},[1]);
