import { loadPage } from "./navigation.js";

document.addEventListener('DOMContentLoaded', () => {
   loadPage('home');
});

document.getElementById("min-button").addEventListener("click", () => {
    window.api.minimize();
});

const maximizeButton = document.getElementById("max-button");
const maxIcon = document.getElementById('max')

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