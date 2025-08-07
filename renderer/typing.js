document.querySelector('.btn-blue').addEventListener('click', function (){
    window.api.loadChallenge('lesson');
});

document.querySelector('.btn-purple').addEventListener('click', function (){
    window.api.loadChallenge();
});