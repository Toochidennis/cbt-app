const db = require('../models/database');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');
//const fetch = require('node-fetch'); // or use axios
const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));

class ActivationModel {
    /**
     * Generates a unique product key by getting a system-specific identifier.
     */
    static generateProductKey() {
        // Use a package like `node-machine-id` to get a unique machine identifier.
        const machineId = machineIdSync();
        return machineId.slice(0, 8);
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
            const response = await fetch('http://linkskool.com/developmentportal/api/activate.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activationCode, productKey })
            });

            const responseData = await response.json();

            if (!response.ok) {
                //  console.error('Server error:', responseData);
                // throw new Error(responseData.message || 'Server error');
                return responseData;
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
                // If valid, update the activation status in your database.
                const stmt = db.prepare(`INSERT OR REPLACE INTO activation (key, value) VALUES (?, ?)`);
                stmt.run('activated', 'true');
                return { success: true };
            } else {
                return { success: false, error: 'Activation validation failed: Invalid hash.' };
            }
        } catch (e) {
            //  console.error('Network or unexpected error:', error);
            return { success: false, error: error.message };
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

            console.log("hash", shortHash);//645fc944

            // Compare the hashes
            if (shortHash === serverHash) {
                // If valid, update the activation status in your database.
                const stmt = db.prepare(`INSERT OR REPLACE INTO activation (key, value) VALUES (?, ?)`);
                stmt.run('activated', 'true');
                return { success: true };
            } else {
                return { success: false, error: 'Activation validation failed: Invalid hash.' };
            }
        } catch (e) {
            //  console.error('Network or unexpected error:', error);
            return { success: false, error: e.message };
        }
    }

    /**
     * Retrieves the activation state.
     */
    static isActivated() {
        const stmt = db.prepare(`SELECT value FROM activation WHERE key = ?`);
        const row = stmt.get('activated');
        return row && row.value === 'true';
    }
}

module.exports = ActivationModel;
