const fs = require('fs');
const path = require('path');
const os = require('os');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

class ActivationModel {
    static activationFilePath = path.join(os.homedir(), '.config', 'LinkSkool', 'activation.json');

    static ensureDirectoryExists() {
        const dir = path.dirname(this.activationFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    static generateProductKey() {
        return machineIdSync().slice(0, 8);
    }

    static saveActivationStatus(isActivated) {
        this.ensureDirectoryExists();
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 365);
        const data = { activated: isActivated, expiresAt: expirationDate.toISOString() };
        fs.writeFileSync(this.activationFilePath, JSON.stringify(data, null, 2), 'utf8');
    }

    static isActivated() {
        if (!fs.existsSync(this.activationFilePath)) return false;

        try {
            const data = JSON.parse(fs.readFileSync(this.activationFilePath, 'utf8'));
            const expirationDate = new Date(data.expiresAt);
            const currentDate = new Date();

            if (data.activated === true && currentDate < expirationDate) {
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Error reading activation file:", error);
            return false;
        }
    }

    /**
     * Validates activation by sending the activation code and generated product key
     * to the server, comparing the server's hash to a locally computed hash.
     */
    static async validateActivationOnline(activationCode) {
        try {
            const productKey = this.generateProductKey();

            //Send activation code and product key to your server
            //(Your server should hash the received productKey with its secret and return the hash)
            const response = await fetch('http://linkskool.net/api/v1/activate.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activationCode, productKey })
            });

            const responseData = await response.json();

            if (!response.ok) {
                //  console.error('Server error:', responseData);
                // throw new Error(responseData.message || 'Server error');
                return { success: false, error: 'Invalid activation code' };
            }

            // Compute local hash for comparison
            const localHash = crypto
                .createHash('sha256')
                .update(`${activationCode}-${productKey}`)
                .digest('hex');

            const shortHash = localHash.slice(0, 6).toUpperCase();
            const serverHash = responseData.hashKey;

            // Compare the hashes
            if (shortHash === serverHash) {
                this.saveActivationStatus(true);
                return { success: true, error: '' };
            } else {
                return { success: false, error: 'Activation validation failed: Invalid hash.' };
            }
        } catch (e) {
            // console.error('Network or unexpected error:', error);
            return { success: false, error: 'An error occurred. Please try again.' };
        }
    }

    /**
    * Validates activation by comparing the server's hash to a locally computed hash.
    */
    static async validateActivationOffline(activationCode, serverHash) {
        try {
            const productKey = this.generateProductKey();

            // Compute local hash for comparison
            const localHash = crypto
                .createHash('sha256')
                .update(`${activationCode}-${productKey}`)
                .digest('hex');

            const shortHash = localHash.slice(0, 6).toUpperCase();

          //  console.log("hash", shortHash);//645fc944

            // Compare the hashes
            if (shortHash === serverHash) {
                this.saveActivationStatus(true);
                return { success: true, error: '' };
            } else {
                return { success: false, error: 'Activation validation failed: Invalid hash.' };
            }
        } catch (e) {
            //  console.error('Network or unexpected error:', error);
            return { success: false, error: e.message };
        }
    }
}

module.exports = ActivationModel;
