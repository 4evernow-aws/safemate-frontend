const { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenAssociateTransaction, Hbar } = require('@hashgraph/sdk');

// Test if the issue is with token association limits
async function testTokenAssociationLimit() {
  try {
    console.log('Testing token association limit issue...\n');
    
    // User's private key and account
    const userPrivateKeyHex = '302e020100300506032b657004220420a2f74d74cdf559eed3ae11d41184c26a27544814da356889eec4e9f01328ca3b';
    const userAccountId = '0.0.6890393';
    
    // Parse private key
    const userPrivateKey = PrivateKey.fromStringDer(userPrivateKeyHex);
    console.log('✅ User private key parsed successfully');
    
    // Create client
    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(userAccountId), userPrivateKey);
    console.log('✅ Client configured with user credentials');
    
    // Test 1: Try to create a token without association
    console.log('\n=== Test 1: Create Token (should work) ===');
    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName('Test Token')
        .setTokenSymbol('TEST')
        .setTokenType(1) // NON_FUNGIBLE_UNIQUE
        .setDecimals(0)
        .setInitialSupply(0)
        .setSupplyType(0) // INFINITE
        .setTreasuryAccountId(AccountId.fromString(userAccountId))
        .setAdminKey(userPrivateKey.publicKey)
        .setSupplyKey(userPrivateKey.publicKey)
        .setFreezeDefault(false)
        .setMaxTransactionFee(new Hbar(2));
      
      transaction.freezeWith(client);
      console.log('✅ Transaction created and frozen');
      
      const signedTransaction = await transaction.sign(userPrivateKey);
      console.log('✅ Transaction signed successfully');
      
      const response = await signedTransaction.execute(client);
      console.log('✅ Token creation executed successfully:', response.transactionId.toString());
      
      // Get the token ID
      const receipt = await new (require('@hashgraph/sdk').TransactionReceiptQuery)()
        .setTransactionId(response.transactionId)
        .execute(client);
      
      const tokenId = receipt.tokenId;
      console.log('✅ Token created with ID:', tokenId.toString());
      
      // Test 2: Try to associate with the token
      console.log('\n=== Test 2: Token Association (might fail due to limit) ===');
      try {
        const associateTransaction = new TokenAssociateTransaction()
          .setAccountId(AccountId.fromString(userAccountId))
          .setTokenIds([tokenId])
          .setMaxTransactionFee(new Hbar(1))
          .freezeWith(client);
        
        const signedAssociateTransaction = await associateTransaction.sign(userPrivateKey);
        const associateResponse = await signedAssociateTransaction.execute(client);
        console.log('✅ Token association successful:', associateResponse.transactionId.toString());
      } catch (associateError) {
        console.log('❌ Token association failed:', associateError.message);
        console.log('This might be due to max_automatic_token_associations: 0');
      }
      
    } catch (createError) {
      console.log('❌ Token creation failed:', createError.message);
      console.log('This suggests the issue is with the token creation itself, not association');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testTokenAssociationLimit();
