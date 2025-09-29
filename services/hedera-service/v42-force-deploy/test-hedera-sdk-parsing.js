const { PrivateKey } = require('@hashgraph/sdk');

// Test private key parsing for both operator and user
console.log('Testing Hedera SDK Private Key Parsing...\n');

// User private key (from our test)
const userPrivateKeyHex = '302e020100300506032b657004220420a2f74d74cdf559eed3ae11d41184c26a27544814da356889eec4e9f01328ca3b';
const userPublicKeyHex = '302a300506032b6570032100f8c575bdaddf2db1ef668ad882d0664f08f874e5194b3273bc52084c1c91f575';

// Operator private key (from our test)
const operatorPrivateKeyHex = '302e020100300506032b657004220420a74b2a24706db9034445e6e03a0f3fd7a82a926f6c4a95bc5de9a720d453f9f9';
const operatorPublicKeyHex = '302a300506032b6570032100c5712af6c6211bd23fbd24ca2d3440938aa7ed958750f5064be8817072283ae1';

console.log('=== USER PRIVATE KEY TEST ===');
try {
    // Test user private key parsing
    const userPrivateKey = PrivateKey.fromStringDer(userPrivateKeyHex);
    console.log('✅ User private key parsed successfully');
    console.log('User private key type:', userPrivateKey.constructor.name);
    console.log('User private key algorithm:', userPrivateKey.algorithm);
    
    // Get derived public key
    const userDerivedPublicKey = userPrivateKey.publicKey.toString();
    console.log('User derived public key:', userDerivedPublicKey);
    console.log('User stored public key: ', userPublicKeyHex);
    console.log('User public keys match:', userDerivedPublicKey === userPublicKeyHex);
    
    if (userDerivedPublicKey !== userPublicKeyHex) {
        console.log('❌ MISMATCH: User public keys do not match!');
    } else {
        console.log('✅ User public keys match correctly');
    }
} catch (error) {
    console.log('❌ User private key parsing failed:', error.message);
}

console.log('\n=== OPERATOR PRIVATE KEY TEST ===');
try {
    // Test operator private key parsing
    const operatorPrivateKey = PrivateKey.fromStringDer(operatorPrivateKeyHex);
    console.log('✅ Operator private key parsed successfully');
    console.log('Operator private key type:', operatorPrivateKey.constructor.name);
    console.log('Operator private key algorithm:', operatorPrivateKey.algorithm);
    
    // Get derived public key
    const operatorDerivedPublicKey = operatorPrivateKey.publicKey.toString();
    console.log('Operator derived public key:', operatorDerivedPublicKey);
    console.log('Operator stored public key: ', operatorPublicKeyHex);
    console.log('Operator public keys match:', operatorDerivedPublicKey === operatorPublicKeyHex);
    
    if (operatorDerivedPublicKey !== operatorPublicKeyHex) {
        console.log('❌ MISMATCH: Operator public keys do not match!');
    } else {
        console.log('✅ Operator public keys match correctly');
    }
} catch (error) {
    console.log('❌ Operator private key parsing failed:', error.message);
}

console.log('\n=== COMPARISON ===');
console.log('User private key length:', userPrivateKeyHex.length);
console.log('Operator private key length:', operatorPrivateKeyHex.length);
console.log('Both keys are DER-encoded:', userPrivateKeyHex.startsWith('302e') && operatorPrivateKeyHex.startsWith('302e'));
