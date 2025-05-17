const paymentModal = document.getElementById('payment-modal');
const codeInput = document.getElementById('activation-code');
const activateBtn = document.getElementById('activate-btn');
const feedback = document.querySelector('.feedback');
const skipBtn = document.querySelector('.skip');
const loadingOverlay = document.getElementById("loading-overlay");

const {id:categoryId, isFree} = JSON.parse(localStorage.getItem('category'));
const { courseId, courseName, email } = JSON.parse(localStorage.getItem('courseData'));

function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

function getNumOfVideosWatched() {
    const counts = JSON.parse(localStorage.getItem('courseViewCounts') || '{}');
    return counts[courseId] || 0;
}

function incrementVideosWatched() {
    const counts = JSON.parse(localStorage.getItem('courseViewCounts') || '{}');
    counts[courseId] = (counts[courseId] || 0) + 1;
    console.log(`Course ${courseId} view count:`, counts[courseId]);
    localStorage.setItem('courseViewCounts', JSON.stringify(counts));
}

function showPaymentModal() {
    paymentModal.style.display = 'flex';
}

function hidePaymentModal() {
    paymentModal.style.display = 'none';
}

async function checkAndShowModal() {
    if (isFree === 0) {
        incrementVideosWatched();
        disableUIIfUnpaid();
        
        const count = getNumOfVideosWatched();
        const isActivated = await window.api.getCourseActivation(categoryId, courseId);

        if (!isActivated && (count > 2 || count === 0)) {
            showPaymentModal();
            return false;
        }

        return true;
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
        if (categoryId && courseId) {
            const { success, error } = await window.api.validateCourseActivation(code, categoryId, courseId);

            feedback.textContent = success ? "Activation successful" : error;

            if (success) {
                hidePaymentModal();
                location.reload();
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

async function disableUIIfUnpaid() {
    if (isFree === 0) {
        const count = getNumOfVideosWatched();
        const isActivated = await window.api.getCourseActivation(categoryId, courseId);

        if (!isActivated && count > 2) {
            disableAllExceptActivateAndClose();
        }
    }else{
        enableAllUI();
    }
}

function enableAllUI() {
    const allElements = document.querySelectorAll('button, input, iframe, select, textarea, a');
    allElements.forEach(el => {
        el.disabled = false;
        el.style.pointerEvents = 'auto';
        el.style.opacity = '1';
    });
}


function disableAllExceptActivateAndClose() {
    const allButtons = document.querySelectorAll('button');
    const closeBtn = document.getElementById('close-learn');

    allButtons.forEach(btn => {
        if (btn !== activateBtn && btn !== closeBtn) {
            btn.disabled = true;
            btn.classList.add('disabled');
            btn.style.pointerEvents = 'none'; // disable clicks via CSS too
            btn.style.opacity = '0.6'; // optional: visually dim
        }
    });

    const allInputs = document.querySelectorAll('input, select, iframe, textarea, a');
    allInputs.forEach(el => {
        if (el !== activateBtn && el !== closeBtn && el !== codeInput) {
            el.disabled = true;
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.6';
        }
    });
}


// Export for reuse
module.exports = { checkAndShowModal, showLoading, hideLoading, disableUIIfUnpaid };
