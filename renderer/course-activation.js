const ActivationModel = require('../models/ActivationModel');

const paymentModal = document.getElementById('payment-modal');
const codeInput = document.getElementById('activation-code');
const activateBtn = document.getElementById('activate-btn');
const feedback = document.querySelector('.feedback');
const skipBtn = document.querySelector('.skip');
const loadingOverlay = document.getElementById("loading-overlay");

let { categoryId, isFree } = localStorage.getItem('category');

function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function getNumOfVideosWatched() {
    return parseInt(localStorage.getItem('count'), 10) || 0;
}

function incrementVideosWatched() {
    const current = getNumOfVideosWatched();
    localStorage.setItem('count', `${current + 1}`);
}

function showPaymentModal() {
    paymentModal.style.display = 'flex';
}

function hidePaymentModal() {
    paymentModal.style.display = 'none';
}

function checkAndShowModal() {
    if (!categoryId || !isFree) return;

    console.log('cat', categoryId);

    if (isFree === 0) {
        incrementVideosWatched();

        const count = getNumOfVideosWatched();
        const isActivated = ActivationModel.isCourseActivated(categoryId);

        if (!isActivated && (count >= 2 || count === 0)) {
            showPaymentModal();
        }
    }
}

async function validateCodeOnline() {
    const code = codeInput.value.trim();

    if (code === '') {
        feedback.textContent = 'Activation code is required';
        return;
    }

    try {
        showLoading();
        if (categoryId) {
            const { success, error } = await ActivationModel.validateCourseOnline(categoryId, code);

            feedback.textContent = success ? "Activation successful" : error;

            if (success) {
                hidePaymentModal();
            }
        } else {
            feedback.textContent = 'Invalid category id';
        }
    } catch (err) {
        console.error("Activation error:", err);
        feedback.textContent = "An error occurred. Please try again.";
    } finally {
        hideLoading();
    }
}

skipBtn.addEventListener('click', () => {
    hidePaymentModal();
});

activateBtn.addEventListener('click', () => {
    validateCodeOnline();
});

// Export for reuse
module.exports = { checkAndShowModal };
