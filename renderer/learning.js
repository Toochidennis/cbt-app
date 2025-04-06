
const axios = require('axios')

axios.get('https://linkschoolonline.com/courses')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });