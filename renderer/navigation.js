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
