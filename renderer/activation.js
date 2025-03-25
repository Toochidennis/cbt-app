
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

async function validateCodeOnline() {
    const code = codeInput1.value.trim();

    if (code === '') {
        onlineFeedback.textContent = 'Pin is required';;
    } else {
        const { success: status, error: message } = await window.api.validateActivationOnline(code);
        console.log("is activated:", status, " error: ", message);

        if (status) {
            onlineFeedback.textContent = "Activation successfully";
            // window.api.openSelectSubjectWindow();
        } else {
            onlineFeedback.textContent = message;
        }
    }
}

async function validateCodeOffline(type = 'pin') {
    const code = codeInput2.value.trim();
    const code2 = codeInput3.value.trim();
    const hash1 = hashInput1.value.trim();
    const hash2 = hashInput2.value.trim();

    switch (type) {
        case 'transfer':
            if (code2 === '' || hash2 === '') {
                offlineFeedback2.textContent = 'Pin and activation code is required';
            } else {
                const { success: status, error: message } = await window.api.validateActivationOffline(code, hash);
                console.log("is activated:", status, " error: ", message);

                if (status) {
                    offlineFeedback2.textContent = "Activation successfully";
                    // window.api.openSelectSubjectWindow();
                } else {
                    offlineFeedback2.textContent = message;
                }
            }
            break;
        case 'pin':
            if (code === '' || hash1 === '') {
                offlineFeedback1.textContent = 'Pin and activation code is required';
            } else {
                const { success: status, error: message } = await window.api.validateActivationOffline(code, hash);
                console.log("is activated:", status, " error: ", message);

                if (status) {
                    offlineFeedback1.textContent = "Activation successfully";
                    // window.api.openSelectSubjectWindow();
                } else {
                    offlineFeedback1.textContent = message;
                }
            }
            break;
        default:
            return
    }
}

onlineActivateBtn.addEventListener('click', () => {
    validateCodeOnline();
});

offlineActivateBtn1.addEventListener('click', ()=>{
    validateCodeOffline();
});

offlineActivateBtn2.addEventListener('click', ()=>{
    validateCodeOffline('transfer');
});

closeBtn.addEventListener('click', () => {
    window.api.closeActivationWindow();
})
