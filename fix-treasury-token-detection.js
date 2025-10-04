/**
 * FIXED: Enhanced Treasury Token Detection for V47.13
 * 
 * This fixes the issue where folders are created but not appearing in listings.
 * The problem is in the queryUserFoldersFromBlockchain function.
 */

/**
 * Enhanced query for user's folders using improved treasury token detection
 */
async function queryUserFoldersFromBlockchain(userId) {
  try {
    console.log(`🔍 V47.13 FIX: Enhanced treasury token detection for user: ${userId}`);
    
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
    
    console.log(`🔍 V47.13 FIX: Account info retrieved, checking ${accountInfo.tokenRelationships.size} token relationships`);
    
    const folders = [];
    
    // ENHANCED: Look for folder collection tokens with multiple symbol patterns
    for (const tokenId of accountInfo.tokenRelationships.keys()) {
      try {
        console.log(`🔍 V47.13 FIX: Checking token: ${tokenId.toString()}`);
        
        const tokenInfo = await new TokenInfoQuery()
          .setTokenId(tokenId)
          .execute(client);
        
        console.log(`🔍 V47.13 FIX: Token info: ${tokenInfo.symbol} (${tokenInfo.name})`);
        
        // ENHANCED: Check for folder collection token patterns (fldr/sfldr only)
        const isFolderCollection = 
          tokenInfo.symbol === 'fldr' || 
          tokenInfo.symbol === 'sfldr';
        
        if (isFolderCollection) {
          console.log(`✅ V47.13 FIX: Found folder collection token: ${tokenId.toString()} (${tokenInfo.symbol})`);
          
          // Check if user owns any NFT serials for this token
          const tokenRelationship = accountInfo.tokenRelationships.get(tokenId);
          console.log(`🔍 V47.13 FIX: Token relationship:`, {
            tokenId: tokenId.toString(),
            balance: tokenRelationship.balance.toString(),
            frozen: tokenRelationship.frozen,
            kycGranted: tokenRelationship.kycGranted
          });
          
          const ownsSerials = tokenRelationship.balance.toNumber() > 0;
          
          if (ownsSerials) {
            console.log(`✅ V47.13 FIX: User owns ${tokenRelationship.balance.toNumber()} folder NFTs`);
            
            // Get all NFT serials for this collection
            const totalSupply = tokenInfo.totalSupply.toNumber();
            console.log(`🔍 V47.13 FIX: Total supply: ${totalSupply}, User balance: ${tokenRelationship.balance.toNumber()}`);
            
            // ENHANCED: Query all NFT serials in the collection with better error handling
            for (let serial = 1; serial <= totalSupply; serial++) {
              try {
                console.log(`🔍 V47.13 FIX: Querying NFT serial ${serial}...`);
                
                const nftInfo = await new TokenNftInfoQuery()
                  .setTokenId(tokenId)
                  .setStart(serial)
                  .setEnd(serial)
                  .execute(client);
                
                if (nftInfo.length > 0 && nftInfo[0].metadata) {
                  const metadata = JSON.parse(nftInfo[0].metadata.toString());
                  console.log(`✅ V47.13 FIX: Folder metadata for serial ${serial}:`, metadata);
                  
                  // Check if this is a folder (type = 'f' for compressed format)
                  if (metadata.t === 'f') {
                    const folderId = `${tokenId.toString()}_${serial}`;
                    
                    // Handle compressed metadata format
                    const parentFolderId = metadata.p === "0" ? null : metadata.p;
                    const folderName = metadata.n || `Folder ${serial}`;
                    const folderLevel = metadata.l || 0;
                    const folderPath = folderLevel === 0 ? `/${folderName}` : `/${folderName}`;
                    
                    folders.push({
                      id: folderId,
                      name: folderName,
                      parentFolderId: parentFolderId,
                      createdAt: new Date().toISOString(),
                      tokenId: tokenId.toString(),
                      serialNumber: serial,
                      files: [],
                      subfolders: [],
                      level: folderLevel,
                      path: folderPath,
                      hierarchy: {
                        level: folderLevel,
                        path: folderPath,
                        parent: parentFolderId,
                        children: []
                      },
                      // V47.13 FIX: Add debugging info
                      debug: {
                        tokenId: tokenId.toString(),
                        serial: serial,
                        metadata: metadata,
                        owner: userWallet.hedera_account_id
                      }
                    });
                    
                    console.log(`✅ V47.13 FIX: Added folder: ${folderName} (${folderId})`);
                  } else {
                    console.log(`🔍 V47.13 FIX: Serial ${serial} is not a folder (type: ${metadata.t})`);
                  }
                } else {
                  console.log(`🔍 V47.13 FIX: No metadata found for serial ${serial}`);
                }
              } catch (serialError) {
                console.error(`❌ V47.13 FIX: Error querying serial ${serial}:`, serialError);
                // Continue with next serial
              }
            }
          } else {
            console.log(`🔍 V47.13 FIX: User does not own any NFTs in this collection`);
          }
        } else {
          console.log(`🔍 V47.13 FIX: Token ${tokenId.toString()} is not a folder collection (symbol: ${tokenInfo.symbol})`);
        }
      } catch (tokenError) {
        console.error(`❌ V47.13 FIX: Error processing token ${tokenId.toString()}:`, tokenError);
        // Continue with next token
      }
    }
    
    console.log(`✅ V47.13 FIX: Found ${folders.length} folders for user ${userId}`);
    
    // ENHANCED: If no folders found, try fallback to shared collection token
    if (folders.length === 0) {
      console.log(`🔍 V47.13 FIX: No folders found in user's treasury tokens, trying fallback...`);
      
      try {
        // Try the shared collection token 0.0.6920175
        const fallbackTokenId = AccountId.fromString("0.0.6920175");
        console.log(`🔍 V47.13 FIX: Checking fallback collection token: ${fallbackTokenId.toString()}`);
        
        const fallbackTokenInfo = await new TokenInfoQuery()
          .setTokenId(fallbackTokenId)
          .execute(client);
        
        console.log(`🔍 V47.13 FIX: Fallback token info: ${fallbackTokenInfo.symbol} (${fallbackTokenInfo.name})`);
        
        // Check if user has any NFTs in the fallback collection
        const fallbackAccountInfo = await new AccountInfoQuery()
          .setAccountId(AccountId.fromString(userWallet.hedera_account_id))
          .execute(client);
        
        const fallbackRelationship = fallbackAccountInfo.tokenRelationships.get(fallbackTokenId);
        if (fallbackRelationship && fallbackRelationship.balance.toNumber() > 0) {
          console.log(`✅ V47.13 FIX: User has ${fallbackRelationship.balance.toNumber()} NFTs in fallback collection`);
          
          // Query fallback collection NFTs
          const totalSupply = fallbackTokenInfo.totalSupply.toNumber();
          for (let serial = 1; serial <= totalSupply; serial++) {
            try {
              const nftInfo = await new TokenNftInfoQuery()
                .setTokenId(fallbackTokenId)
                .setStart(serial)
                .setEnd(serial)
                .execute(client);
              
              if (nftInfo.length > 0 && nftInfo[0].metadata) {
                const metadata = JSON.parse(nftInfo[0].metadata.toString());
                if (metadata.t === 'f' && metadata.o === userWallet.hedera_account_id) {
                  const folderId = `${fallbackTokenId.toString()}_${serial}`;
                  const folderName = metadata.n || `Folder ${serial}`;
                  
                  folders.push({
                    id: folderId,
                    name: folderName,
                    parentFolderId: metadata.p === "0" ? null : metadata.p,
                    createdAt: new Date().toISOString(),
                    tokenId: fallbackTokenId.toString(),
                    serialNumber: serial,
                    files: [],
                    subfolders: [],
                    level: metadata.l || 0,
                    path: `/${folderName}`,
                    hierarchy: {
                      level: metadata.l || 0,
                      path: `/${folderName}`,
                      parent: metadata.p === "0" ? null : metadata.p,
                      children: []
                    },
                    debug: {
                      tokenId: fallbackTokenId.toString(),
                      serial: serial,
                      metadata: metadata,
                      owner: userWallet.hedera_account_id,
                      source: 'fallback'
                    }
                  });
                  
                  console.log(`✅ V47.13 FIX: Added fallback folder: ${folderName} (${folderId})`);
                }
              }
            } catch (fallbackError) {
              console.error(`❌ V47.13 FIX: Error querying fallback serial ${serial}:`, fallbackError);
            }
          }
        } else {
          console.log(`🔍 V47.13 FIX: User has no NFTs in fallback collection`);
        }
      } catch (fallbackError) {
        console.error(`❌ V47.13 FIX: Fallback collection check failed:`, fallbackError);
      }
    }
    
    console.log(`✅ V47.13 FIX: Final result: ${folders.length} folders found for user ${userId}`);
    
    return {
      success: true,
      data: folders
    };
    
  } catch (error) {
    console.error(`❌ V47.13 FIX: Error querying blockchain for user ${userId}:`, error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

module.exports = {
  queryUserFoldersFromBlockchain
};
