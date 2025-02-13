const ACTIVATION_CODE = 'LINK-5416-SKOOL';

const feedback = document.getElementById('feedback');
const proceedBtn = document.getElementById('proceed-btn');
const codeInput = document.getElementById('code');

async function validateCode() {
    const code = codeInput.value.trim();
    if (code === ACTIVATION_CODE) {
        await window.api.saveActivationState(true);
        feedback.textContent = 'Activation successful';
        window.api.closeActivationWindow();
        window.api.openSelectSubjectWindow();
    } else {
        feedback.textContent = 'Invalid activation code.';
    }
}

proceedBtn.addEventListener('click', () => {
    validateCode();
});