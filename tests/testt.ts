import crypto from "node:crypto";

async function sha256(message) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function compareHash(input, expectedHash) {
    const inputHash = await sha256(input);
    return inputHash === expectedHash;
}

const userInput = 'Sensitive data';
const storedHash = '474de7276ecc120b83bc42291a96a36c648a0f6428bf7c88bfdccf32bfbb4339';

compareHash(userInput, storedHash)
    .then(match => {
        if (match) {
            console.log('Hashes match! The input is likely valid.');
        } else {
            console.log('Hashes do not match! The input is different from the expected value.');
        }
    })
    .catch(error => console.error('Error:', error));