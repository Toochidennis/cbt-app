const axios = require('axios');

fetchVideos();

function fetchVideos() {
    //   showLoader(); // Show loader before starting the request
    axios.get(`https://linkschoolonline.com/videos`)
        .then(response => {
            console.log(response.data);
            console.log("Grouped ", groupedVideos(response.data).scratch);
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

function populateVideos(videos) {
    if (!videos || videos.length === 0) return;

    const categoryContainer = document.getElementById('videos-container');
    const fragment = document.createDocumentFragment();
    categoryContainer.innerHTML = '';

    Object.keys.ma

    const videosContainer = document.createElement('div');
    const category = document.createElement('div');
    const grid = document.createElement('div');
    const gridContent = document.createElement('div');


}