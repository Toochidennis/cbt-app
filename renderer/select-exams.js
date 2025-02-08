import { loadPage } from "./navigation.js";
import state from "./state.js";

document.addEventListener("DOMContentLoaded", function () {
    const closeModalBtn = document.getElementById("close-button");
    const yearDropdown = document.getElementById("exam-year");
    const startBtn = document.getElementById("start-exam");

    closeModalBtn.addEventListener('click', () => {
        // window.api.closeSelectExamWindow();
        const window = remote
    });


    startBtn.addEventListener('click', () => {
      
        window.api.closeSelectExamWindow(()=>{
            alert("hello");
            // window.api.onSecondWindowClosed(() => {
            //     //loadPage("exam");
            //     alert('Hello');
    
            // });
        });



    });



    // Populate the year dropdown dynamically
    const currentYear = new Date().getFullYear() - 1;
    for (let year = currentYear; year >= 2020; year--) {
        let option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearDropdown.appendChild(option);
    }
});
