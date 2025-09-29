const { PrivateKey } = require('@hashgraph/sdk');

// The decrypted private key from KMS (same in both environments)
const decryptedKeyBase64 = "MzAyZTAyMDEwMDMwMDUwNjAzMmI2NTcwMDQyMjA0MjBhMmY3NGQ3NGNkZjU1OWVlZDNhZTExZDQxMTg0YzI2YTI3NTQ0ODE0ZGEzNTY4ODllZWM0ZTlmMDEzMjhjYTNi";

console.log('Testing Hedera SDK parsing of user private key...');
console.log(`Decrypted key base64: ${decryptedKeyBase64}`);

try {
    // Parse the private key using the same method as Lambda
    const privateKey = PrivateKey.fromStringDer(decryptedKeyBase64);
    
    console.log('✅ Private key parsed successfully');
    console.log(`Private key type: ${privateKey.constructor.name}`);
    console.log(`Private key algorithm: ${privateKey.algorithm}`);
    
    // Get the derived public key
    const derivedPublicKey = privateKey.publicKey;
    console.log(`Derived public key: ${derivedPublicKey.toString()}`);
    
    // Expected public key from database
    const expectedPublicKey = "302a300506032b6570032100f8c575bdaddf2db1ef668ad882d0664f08f874e5194b3273bc52084c1c91f575";
    console.log(`Expected public key: ${expectedPublicKey}`);
    console.log(`Public keys match: ${derivedPublicKey.toString() === expectedPublicKey}`);
    
    if (derivedPublicKey.toString() !== expectedPublicKey) {
        console.log('❌ PUBLIC KEY MISMATCH - This is the root cause!');
        console.log('The Hedera SDK is parsing the private key but deriving a different public key than expected.');
    } else {
        console.log('✅ Public keys match - parsing is correct');
    }
    
} catch (error) {
    console.error('❌ Error parsing private key:', error.message);
}
