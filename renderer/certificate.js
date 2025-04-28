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