const db = require('../models/database');
const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');
const fetch = require('node-fetch'); // or use axios

class ActivationModel {
    /**
     * Generates a unique product key by combining the user-supplied activation code
     * with a system-specific identifier.
     */
    static generateProductKey(activationCode) {
        // Use a package like `node-machine-id` to get a unique machine identifier.
        const machineId = machineIdSync(); // you can choose the options you need here
        // Combine the activation code and machine ID (you could add separators, salt, etc.)
        return `${activationCode}-${machineId}`;
    }

    /**
     * Validates activation by sending the activation code and generated product key
     * to the server, comparing the server's hash to a locally computed hash.
     */
    static async validateActivation(activationCode) {
        const productKey = this.generateProductKey(activationCode);

        // Send activation code and product key to your server
        // (Your server should hash the received productKey with its secret and return the hash)
        const response = await fetch('https://yourserver.com/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activationCode, productKey })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }

        const { hash: serverHash } = await response.json();

        // Compute local hash for comparison. For example, using SHA256:
        const localHash = crypto.createHash('sha256').update(productKey).digest('hex');

        // Compare the hashes
        if (localHash === serverHash) {
            // If valid, update the activation status in your database.
            const stmt = db.prepare(`INSERT OR REPLACE INTO activation (key, value) VALUES (?, ?)`);
            stmt.run('activated', 'true');
            // Optionally store the activation code or product key as well.
            return true;
        } else {
            return false;
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

