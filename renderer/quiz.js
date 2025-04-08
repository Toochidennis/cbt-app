const state = require('./state');

const countdown = document.getElementById('countdown');
const submitBtn = document.getElementById('submit-button');
const progress = document.getElementById('progress');
const questionImage = document.getElementById('question-image');
const passageDiv = document.getElementById('passage');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const nextBtn = document.getElementById('next-btn');
const prevBtn = document.getElementById('prev-btn');


window.api.startExam((_, data) => {

});

