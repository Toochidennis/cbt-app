(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const loadingOverlay = document.getElementById("loading-overlay");
const closeBtn = document.getElementById('close-btn');
const onlineFeedback = document.getElementById('feedback-1');
const offlineFeedback1 = document.getElementById('feedback-2');
const offlineFeedback2 = document.getElementById('feedback-3');
const onlineActivateBtn = document.getElementById('activate-online');
const offlineActivateBtn1 = document.getElementById('activate-offline-1');
const offlineActivateBtn2 = document.getElementById('activate-offline-2');
const codeInput1 = document.getElementById('pin-1');
const codeInput2 = document.getElementById('pin-2');
const codeInput3 = document.getElementById('pin-3');
const hashInput1 = document.getElementById('hash-1');
const hashInput2 = document.getElementById('hash-2');
const productKey1 = document.getElementById('product-key-1');
const productKey2 = document.getElementById('product-key-2');

async function generateProductKey() {
    const productKey = await window.api.generateProductKey();

    productKey1.textContent = productKey;
    productKey2.textContent = productKey;
}

generateProductKey();

function showLoading() {
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
}

async function validateCodeOnline() {
    const code = codeInput1.value.trim();

    if (code === '') {
        onlineFeedback.textContent = 'Pin is required';
        return;
    }

    try {
        showLoading();

        const { success: status, error: message } = await window.api.validateActivationOnline(code);

        onlineFeedback.textContent = status ? "Activation successful" : message;

        if (status) {
            window.api.closeActivationWindow();
            window.api.openSelectSubjectWindow();
        }

    } catch (error) {
        onlineFeedback.textContent = "An error occurred. Please try again.";
        console.error("Offline Activation Error:", error);
    } finally {
        hideLoading();
    }
}

async function validateCodeOffline(type = 'pin') {
    const inputs = {
        pin: { code: codeInput2.value.trim(), hash: hashInput1.value.trim(), feedback: offlineFeedback1 },
        transfer: { code: codeInput3.value.trim(), hash: hashInput2.value.trim(), feedback: offlineFeedback2 },
    };

    const { code, hash, feedback } = inputs[type] || {};
    if (!code || !hash) {
        feedback.textContent = 'Pin and activation code are required';
        return;
    }

    try {
        showLoading();

        const { success: status, error: message } = await window.api.validateActivationOffline(code, hash);
        console.log(`Type: ${type}, Activated: ${status}, Error: ${message}`);

        feedback.textContent = status ? "Activation successful" : message;

        if (status) {
            window.api.closeActivationWindow();
            window.api.openSelectSubjectWindow();
        }
    } catch (error) {
        feedback.textContent = "An error occurred. Please try again.";
        console.error("Online Activation Error:", error);
    } finally {
        hideLoading();
    }
}

onlineActivateBtn.addEventListener('click', () => {
    validateCodeOnline();
});

offlineActivateBtn1.addEventListener('click', () => {
    validateCodeOffline();
});

offlineActivateBtn2.addEventListener('click', () => {
    validateCodeOffline('transfer');
});

closeBtn.addEventListener('click', () => {
    window.api.closeActivationWindow();
})

},{}]},{},[1]);
