// Test DER decoding to extract the actual private key
const { PrivateKey } = require('@hashgraph/sdk');

// The decrypted private key from KMS (DER-encoded)
const decryptedKeyBase64 = "MzAyZTAyMDEwMDMwMDUwNjAzMmI2NTcwMDQyMjA0MjBhMmY3NGQ3NGNkZjU1OWVlZDNhZTExZDQxMTg0YzI2YTI3NTQ0ODE0ZGEzNTY4ODllZWM0ZTlmMDEzMjhjYTNi";

console.log('Testing DER decoding of user private key...');
console.log(`Decrypted key base64: ${decryptedKeyBase64}`);

// Convert base64 to bytes
const keyBytes = Buffer.from(decryptedKeyBase64, 'base64');
console.log(`Key bytes length: ${keyBytes.length}`);
console.log(`Key bytes (first 20): ${Array.from(keyBytes.slice(0, 20)).join(',')}`);

// The DER structure should be:
// 30 2e 02 01 00 30 05 06 03 2b 65 70 04 22 04 20 [32-byte private key]
// Let's try to extract the 32-byte private key from the DER structure

try {
    // Look for the pattern that indicates the start of the private key
    // DER structure: 30 2e 02 01 00 30 05 06 03 2b 65 70 04 22 04 20 [32 bytes]
    let privateKeyStart = -1;
    
    // Find the sequence 04 20 (which indicates 32 bytes of data)
    for (let i = 0; i < keyBytes.length - 1; i++) {
        if (keyBytes[i] === 0x04 && keyBytes[i + 1] === 0x20) {
            privateKeyStart = i + 2; // Skip the 04 20 bytes
            break;
        }
    }
    
    if (privateKeyStart !== -1 && privateKeyStart + 32 <= keyBytes.length) {
        // Extract the 32-byte private key
        const rawPrivateKey = keyBytes.slice(privateKeyStart, privateKeyStart + 32);
        console.log(`Found private key at position ${privateKeyStart}`);
        console.log(`Raw private key (32 bytes): ${Array.from(rawPrivateKey).join(',')}`);
        
        // Try to create PrivateKey from raw bytes
        const privateKey = PrivateKey.fromBytes(rawPrivateKey);
        console.log('✅ Private key created from raw bytes');
        
        // Get the derived public key
        const derivedPublicKey = privateKey.publicKey;
        console.log(`Derived public key: ${derivedPublicKey.toString()}`);
        
        // Expected public key from database
        const expectedPublicKey = "302a300506032b6570032100f8c575bdaddf2db1ef668ad882d0664f08f874e5194b3273bc52084c1c91f575";
        console.log(`Expected public key: ${expectedPublicKey}`);
        console.log(`Public keys match: ${derivedPublicKey.toString() === expectedPublicKey}`);
        
        if (derivedPublicKey.toString() === expectedPublicKey) {
            console.log('🎉 SUCCESS: Found the correct private key extraction method!');
        } else {
            console.log('❌ Still not matching - need to investigate further');
        }
        
    } else {
        console.log('❌ Could not find private key in DER structure');
        console.log('Full DER structure:');
        console.log(keyBytes.toString('hex'));
    }
    
} catch (error) {
    console.error('❌ Error processing DER structure:', error.message);
}
