// Fix for folder listing issue
// The problem is in the queryUserFoldersFromBlockchain function

/**
 * Query blockchain directly for user's folders - FIXED VERSION
 */
async function queryUserFoldersFromBlockchain(userId) {
  try {
    console.log(`🔍 Querying blockchain for folders belonging to user: ${userId}`);
    
    // Get user's wallet
    const userWallet = await getUserWallet(userId);
    if (!userWallet) {
      console.log(`❌ No wallet found for user: ${userId}`);
      return { success: true, data: [] };
    }
    
    console.log(`🔍 Found wallet for user: ${userId}, account: ${userWallet.hedera_account_id}`);
    
    // Initialize client with operator credentials
    const client = await initializeHederaClient();
    
    // Query for tokens owned by user
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(AccountId.fromString(userWallet.hedera_account_id))
      .execute(client);
    
    console.log(`🔍 Account info retrieved, checking ${accountInfo.tokenRelationships.size} token relationships`);
    
    const folders = [];
    
    // Check each token to see if it's a folder and user owns NFT serials
    for (const tokenId of accountInfo.tokenRelationships.keys()) {
      try {
        console.log(`🔍 Checking token: ${tokenId.toString()}`);
        
        const tokenInfo = await new TokenInfoQuery()
          .setTokenId(tokenId)
          .execute(client);
        
        console.log(`🔍 Token info: ${tokenInfo.symbol} (${tokenInfo.name})`);
        
        // Check if this is a folder token (symbol = 'FOLDER')
        if (tokenInfo.symbol === 'FOLDER') {
          console.log(`✅ Found folder token: ${tokenId.toString()}`);
          
          // Check if user owns any NFT serials for this token
          const tokenRelationship = accountInfo.tokenRelationships.get(tokenId);
          console.log(`🔍 Token relationship:`, {
            tokenId: tokenId.toString(),
            balance: tokenRelationship.balance.toString(),
            frozen: tokenRelationship.frozen,
            kycGranted: tokenRelationship.kycGranted
          });
          
          // FIXED: For NFTs, check if user owns serials OR is the treasury
          const isTreasury = tokenInfo.treasuryAccountId && 
            tokenInfo.treasuryAccountId.toString() === userWallet.hedera_account_id;
          const ownsSerials = tokenRelationship.balance.toNumber() > 0;
          
          console.log(`🔍 Treasury check: isTreasury=${isTreasury}, treasuryAccountId=${tokenInfo.treasuryAccountId?.toString()}, userAccountId=${userWallet.hedera_account_id}`);
          console.log(`🔍 Serial check: ownsSerials=${ownsSerials}, balance=${tokenRelationship.balance.toNumber()}`);
          
          // FIXED: Also check if user is the token creator (admin key holder)
          const isAdmin = tokenInfo.adminKey && 
            tokenInfo.adminKey.toString() === userWallet.public_key;
          
          console.log(`🔍 Admin check: isAdmin=${isAdmin}, adminKey=${tokenInfo.adminKey?.toString()}, userPublicKey=${userWallet.public_key}`);
          
          if (ownsSerials || isTreasury || isAdmin) {
            console.log(`✅ User ${isTreasury ? 'is treasury for' : isAdmin ? 'is admin for' : 'owns'} folder token: ${tokenId.toString()}`);
            
            // Get NFT metadata for serial 1 (our container NFT)
            try {
              const nftInfo = await new TokenNftInfoQuery()
                .setTokenId(tokenId)
                .setStart(1)
                .setEnd(1)
                .execute(client);
              
              if (nftInfo.length > 0 && nftInfo[0].metadata) {
                const metadata = JSON.parse(nftInfo[0].metadata.toString());
                console.log(`✅ Folder metadata:`, metadata);
                
                folders.push({
                  id: tokenId.toString(),
                  name: metadata.name || tokenInfo.name,
                  parentFolderId: metadata.parentFolderId || null,
                  createdAt: metadata.createdAt,
                  tokenId: tokenId.toString(),
                  files: [],
                  subfolders: [],
                  // Add additional info for debugging
                  isTreasury: isTreasury,
                  isAdmin: isAdmin,
                  ownsSerials: ownsSerials,
                  balance: tokenRelationship.balance.toNumber()
                });
              } else {
                console.log(`⚠️ No metadata found for folder token: ${tokenId.toString()}`);
                // Still add the folder with basic info
                folders.push({
                  id: tokenId.toString(),
                  name: tokenInfo.name,
                  parentFolderId: null,
                  createdAt: new Date().toISOString(),
                  tokenId: tokenId.toString(),
                  files: [],
                  subfolders: [],
                  // Add additional info for debugging
                  isTreasury: isTreasury,
                  isAdmin: isAdmin,
                  ownsSerials: ownsSerials,
                  balance: tokenRelationship.balance.toNumber()
                });
              }
            } catch (nftError) {
              console.log(`⚠️ Error getting NFT info for token ${tokenId}:`, nftError.message);
              // Still add the folder with basic info
              folders.push({
                id: tokenId.toString(),
                name: tokenInfo.name,
                parentFolderId: null,
                createdAt: new Date().toISOString(),
                tokenId: tokenId.toString(),
                files: [],
                subfolders: [],
                // Add additional info for debugging
                isTreasury: isTreasury,
                isAdmin: isAdmin,
                ownsSerials: ownsSerials,
                balance: tokenRelationship.balance.toNumber()
              });
            }
          } else {
            console.log(`ℹ️ User has no NFT serials, is not treasury, and is not admin for folder token: ${tokenId.toString()}`);
          }
        }
      } catch (tokenError) {
        console.warn(`⚠️ Error checking token ${tokenId}:`, tokenError.message);
      }
    }
    
    console.log(`✅ Found ${folders.length} folders on blockchain for user: ${userId}`);
    return { success: true, data: folders };
    
  } catch (error) {
    console.error(`❌ Failed to query folders from blockchain:`, error);
    console.error(`❌ Error details:`, {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return { 
      success: false, 
      error: error.message || 'UnknownError'
    };
  }
}
