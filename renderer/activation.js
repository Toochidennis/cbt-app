const feedback = document.getElementById('feedback');
const proceedBtn = document.getElementById('proceed-btn');
const codeInput = document.getElementById('code');
const closeBtn = document.getElementById('close-btn');

async function validateCode() {
    const code = codeInput.value.trim();

    if(code === ''){
        alert('Activation code is required');
    }else{
        const response =  await window.api.validateActivationCode(code);
        console.log("is activated:", response);
    }

    


    // if (code === ACTIVATION_CODE) {
    //     await window.api.saveActivationState(true);
    //     feedback.textContent = 'Activation successful';
    //     window.api.closeActivationWindow();
    //     window.api.openSelectSubjectWindow();
    // } else {
    //     feedback.textContent = 'Invalid activation code.';
    // }
}

proceedBtn.addEventListener('click', () => {
    validateCode();
});

closeBtn.addEventListener('click', ()=>{
    window.api.closeActivationWindow();
})

