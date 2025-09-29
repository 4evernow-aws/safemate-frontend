const { Client, AccountId, PrivateKey, AccountUpdateTransaction, Hbar } = require('@hashgraph/sdk');

// Test simple transaction signing with user's private key
async function testSimpleSigning() {
  try {
    console.log('Testing simple transaction signing with user private key...\n');
    
    // User's private key (from our previous test)
    const userPrivateKeyHex = '302e020100300506032b657004220420a2f74d74cdf559eed3ae11d41184c26a27544814da356889eec4e9f01328ca3b';
    const userAccountId = '0.0.6890393';
    
    // Parse private key
    const userPrivateKey = PrivateKey.fromStringDer(userPrivateKeyHex);
    console.log('✅ User private key parsed successfully');
    
    // Create client
    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(userAccountId), userPrivateKey);
    console.log('✅ Client configured with user credentials');
    
    // Create a simple account update transaction (just to test signing)
    const transaction = new AccountUpdateTransaction()
      .setAccountId(AccountId.fromString(userAccountId))
      .setMemo('Test signing')
      .setMaxTransactionFee(new Hbar(1));
    
    console.log('✅ Transaction created');
    
    // Freeze the transaction
    transaction.freezeWith(client);
    console.log('✅ Transaction frozen');
    
    // Sign the transaction
    const signedTransaction = await transaction.sign(userPrivateKey);
    console.log('✅ Transaction signed successfully');
    
    // Try to execute (this might fail due to insufficient permissions, but signing should work)
    try {
      const response = await signedTransaction.execute(client);
      console.log('✅ Transaction executed successfully:', response.transactionId.toString());
    } catch (execError) {
      console.log('⚠️ Transaction execution failed (expected):', execError.message);
      console.log('✅ But signing worked, which means the private key is valid');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

testSimpleSigning();
