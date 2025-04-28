(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const templates = {
    1: '../assets/img/scratch-cert.svg',
    2: '../assets/img/graphic-cert.svg',
    3: '../assets/img/web-cert.svg'
};

window.api.onSetName((_, name, courseId) => {
    const certTemplate = document.querySelector('.cert-img');
    const nameSpan = document.querySelector('.cert-name');
    console.log("It rann hereee", name, courseId);

    if (nameSpan && certTemplate) {
        certTemplate.src = templates[courseId];
        nameSpan.innerText = name;
        console.log(name, courseId);
    }
});
},{}]},{},[1]);
