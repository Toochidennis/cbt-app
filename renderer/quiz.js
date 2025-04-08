const state = require('./state');
const axios = require('axios');

const countdown = document.getElementById('countdown');
const submitBtn = document.getElementById('submit-button');
const progress = document.getElementById('progress');
const questionImage = document.getElementById('question-image');
const passageDiv = document.getElementById('passage');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');


fetchQuestions();

function fetchQuestions() {
    axios.get(`https://linkschoolonline.com/quiz}`)
        .then(response => {
            console.log(response.data);
            formatQuestions(response.data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function formatQuestions(response) {
    questionsData = response.map(q => ({
        question_text: q.question_text,
        options: [
            { text: q.option_1_text, image: q.option_1_image },
            { text: q.option_2_text, image: q.option_2_image },
            { text: q.option_3_text, image: q.option_3_image },
            { text: q.option_4_text, image: q.option_4_image }
        ],
        answer: q.answer,
    }));

    console.log(questionsData);
}
