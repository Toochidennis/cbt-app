const axios = require('axios');

fetchVideos();

function fetchVideos() {
    //   showLoader(); // Show loader before starting the request
    axios.get(`https://linkschoolonline.com/videos`)
        .then(response => {
            console.log(response.data);
            console.log("Grouped ", groupedVideos(response.data));
            populateVideos(groupedVideos(response.data));
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            //    hideLoader(); // Hide loader after the request completes
        });
}

const groupedVideos = (videos) => {
    return grouped = videos.reduce((acc, video) => {
        const { category } = video;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(video);
        return acc;
    }, {});
}

function populateVideos(groupedVideos) {
    if (!groupedVideos || groupedVideos.length === 0) return;

    const categoryContainer = document.getElementById('category-container');
    const fragment = document.createDocumentFragment();
    categoryContainer.innerHTML = '';

    Object.entries(groupedVideos).forEach(([categoryKey, videos]) => {
        const videosContainer = document.createElement('div');
        const category = document.createElement('div');
        const grid = document.createElement('div');

        videosContainer.classList.add('programming-videos');
        category.classList.add('programming-header');
        grid.classList.add('grid');

        if (categoryKey === 'scratch') {
            category.textContent = "Scratch Programming"
        }
        else if (categoryKey === 'web') {
            category.textContent = "Web Development"
        } else {
            category.textContent = categoryKey
        }

        videos.forEach(video => {
            const gridContent = document.createElement('div');
            gridContent.classList.add('grid-content');

            gridContent.innerHTML = `
                <iframe 
                    title="${video.title}"  
                    src="${getEmbedUrl(video.url)}"
                    frameborder="0"
                    allow="accelerometer; autoplay; 
                    clipboard-write; encrypted-media;
                    gyroscope; picture-in-picture; web-share"
                    referrerpolicy="strict-origin-when-cross-origin" 
                    allowfullscreen>
                </iframe>
                <p>${video.title}</p>
                <h6>Easter Kids Coding Fest</h6>
                <span>Powered by Digital Dreams Limited</span>
            `;

            grid.append(gridContent);
        });

        videosContainer.append(category, grid);
        fragment.appendChild(videosContainer);
    });

    categoryContainer.appendChild(fragment);
}

function getEmbedUrl(youtubeUrl) {
    try {
        const url = new URL(youtubeUrl);
        let videoId = '';

        if (url.hostname === 'youtu.be') {
            videoId = url.pathname.slice(1);
        } else if (url.hostname.includes('youtube.com')) {
            videoId = url.searchParams.get('v');
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}` : youtubeUrl;
    } catch (e) {
        return '';
    }
}