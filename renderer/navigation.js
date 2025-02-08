export function loadPage(page) {
    fetch(`pages/${page}.html`)
        .then(response => response.text())
        .then(html => {
            const appDiv = document.getElementById('app');
            appDiv.innerHTML = html;
            const script = document.createElement('script');
            script.type = 'module';
            script.src = `renderer/${page}.js`;
            document.body.appendChild(script);
        })
        .catch(err => console.error('Error loading page:', err));
}
