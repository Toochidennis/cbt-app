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

function switchPage(page) {
    fetch(`pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            return fetch(`js-bundle/${page}.js`); // Fetch the script content
        })
        .then(response => response.text())
        .then(jsCode => {
            eval(jsCode); // Execute the script manually
        })
        .catch(error => console.error("Error loading page/script:", error));
}

module.exports = {loadPage, switchPage}
