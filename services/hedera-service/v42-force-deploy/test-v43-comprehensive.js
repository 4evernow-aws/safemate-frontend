const { Client, AccountId, PrivateKey, TokenCreateTransaction, Hbar } = require('@hashgraph/sdk');

// Comprehensive test to understand the V43 issue
async function testV43Comprehensive() {
  try {
    console.log('Testing V43 comprehensive token creation...\n');
    
    // User's private key and account
    const userPrivateKeyHex = '302e020100300506032b657004220420a2f74d74cdf559eed3ae11d41184c26a27544814da356889eec4e9f01328ca3b';
    const userAccountId = '0.0.6890393';
    
    // Parse private key
    const userPrivateKey = PrivateKey.fromStringDer(userPrivateKeyHex);
    console.log('✅ User private key parsed successfully');
    console.log('Private key type:', userPrivateKey.constructor.name);
    console.log('Private key algorithm:', userPrivateKey.algorithm);
    
    // Create client
    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(userAccountId), userPrivateKey);
    console.log('✅ Client configured with user credentials');
    
    // Test with different transaction fees
    const fees = [5, 10, 20, 50];
    
    for (const fee of fees) {
      console.log(`\n=== Testing with ${fee} HBAR transaction fee ===`);
      
      try {
        const transaction = new TokenCreateTransaction()
          .setTokenName(`Test Token ${fee}HBAR`)
          .setTokenSymbol('TEST')
          .setTokenType(1) // NON_FUNGIBLE_UNIQUE
          .setDecimals(0)
          .setInitialSupply(0)
          .setSupplyType(0) // INFINITE
          .setTreasuryAccountId(AccountId.fromString(userAccountId))
          .setAdminKey(userPrivateKey.publicKey)
          .setSupplyKey(userPrivateKey.publicKey)
          .setMetadataKey(userPrivateKey.publicKey)
          .setFreezeKey(userPrivateKey.publicKey)
          .setWipeKey(userPrivateKey.publicKey)
          .setPauseKey(userPrivateKey.publicKey)
          .setFreezeDefault(false)
          .setMaxTransactionFee(new Hbar(fee));
        
        console.log(`✅ Transaction created with ${fee} HBAR fee`);
        
        transaction.freezeWith(client);
        console.log('✅ Transaction frozen');
        
        const signedTransaction = await transaction.sign(userPrivateKey);
        console.log('✅ Transaction signed successfully');
        
        const response = await signedTransaction.execute(client);
        console.log(`✅ SUCCESS with ${fee} HBAR fee! Transaction ID:`, response.transactionId.toString());
        
        // If we get here, the fee was sufficient
        break;
        
      } catch (error) {
        console.log(`❌ Failed with ${fee} HBAR fee:`, error.message);
        
        if (error.message.includes('INSUFFICIENT_TX_FEE')) {
          console.log('This confirms the fee is too low');
        } else if (error.message.includes('INVALID_SIGNATURE')) {
          console.log('This suggests a signing issue, not a fee issue');
        }
      }
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

testV43Comprehensive();
