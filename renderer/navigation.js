export function loadPage(page) {
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

export function switchPage(page, script) {
    fetch(`pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            document.getElementById("content").innerHTML = html;
            loadScript(script);
        })
        .catch(error => console.error("Error loading page:", error));
}

function loadScript(src) {
    const script = document.createElement('script');
    script.src = `renderer/${src}`;
    script.async = true;
    script.type = 'module';
    document.head.appendChild(script);
}