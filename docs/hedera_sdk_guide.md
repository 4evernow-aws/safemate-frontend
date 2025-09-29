# Hedera SDK Complete User Guide

## 🎯 **What is the Hedera SDK?**

The Hedera SDK is a JavaScript/TypeScript library that provides a complete interface for interacting with the Hedera Hashgraph network. It allows you to create accounts, manage tokens, execute smart contracts, and perform consensus operations.

---

## 📦 **Installation and Setup**

### **Installation**
```bash
# Install Hedera SDK
npm install @hashgraph/sdk

# For TypeScript projects
npm install @types/node
```

### **Basic Setup**
```javascript
const {
    Client,
    PrivateKey,
    AccountId,
    Hbar
} = require('@hashgraph/sdk');

// Create client for testnet
const client = Client.forTestnet();

// Create client for mainnet
const client = Client.forMainnet();

// Set operator (your account for paying fees)
const operatorId = AccountId.fromString('0.0.123456');
const operatorKey = PrivateKey.fromString('your-private-key');

client.setOperator(operatorId, operatorKey);
```

---

## 🔑 **Account Management**

### **Creating New Accounts**

```javascript
const {
    Client,
    AccountCreateTransaction,
    PrivateKey,
    Hbar
} = require('@hashgraph/sdk');

async function createAccount() {
    // Generate new key pair
    const newAccountPrivateKey = PrivateKey.generateED25519();
    const newAccountPublicKey = newAccountPrivateKey.getPublicKey();

    // Create account transaction
    const transaction = await new AccountCreateTransaction()
        .setKey(newAccountPublicKey)
        .setInitialBalance(Hbar.fromTinybars(1000)) // 0.00001 HBAR
        .execute(client);

    // Get receipt
    const receipt = await transaction.getReceipt(client);
    const newAccountId = receipt.accountId;

    console.log('New account ID:', newAccountId.toString());
    console.log('Private key:', newAccountPrivateKey.toString());
    console.log('Public key:', newAccountPublicKey.toString());

    return {
        accountId: newAccountId,
        privateKey: newAccountPrivateKey,
        publicKey: newAccountPublicKey
    };
}
```

### **Account Auto Creation (Recommended for SafeMate)**

```javascript
const { PrivateKey } = require('@hashgraph/sdk');

function createAccountAlias() {
    // Generate key pair
    const privateKey = PrivateKey.generateED25519();
    const publicKey = privateKey.getPublicKey();
    
    // Create account alias
    const accountAlias = `alias-${publicKey.toStringRaw()}`;
    
    return {
        accountAlias,
        privateKey: privateKey.toString(),
        publicKey: publicKey.toString()
    };
}

// Usage in SafeMate
const walletInfo = createAccountAlias();
console.log('Account Alias:', walletInfo.accountAlias);
// User sends HBAR to this alias to activate the account
```

### **Account Balance Query**

```javascript
const { AccountBalanceQuery } = require('@hashgraph/sdk');

async function getAccountBalance(accountId) {
    const balance = await new AccountBalanceQuery()
        .setAccountId(accountId)
        .execute(client);

    console.log(`Account ${accountId} balance:`);
    console.log(`HBAR: ${balance.hbars.toString()}`);
    console.log(`Tokens: ${JSON.stringify(balance.tokens._map)}`);

    return balance;
}
```

### **Account Info Query**

```javascript
const { AccountInfoQuery } = require('@hashgraph/sdk');

async function getAccountInfo(accountId) {
    const info = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(client);

    console.log('Account Info:');
    console.log('ID:', info.accountId.toString());
    console.log('Key:', info.key.toString());
    console.log('Balance:', info.balance.toString());
    console.log('Auto Renew Period:', info.autoRenewPeriod.seconds.toString(), 'seconds');
    console.log('Memo:', info.accountMemo);

    return info;
}
```

---

## 💰 **HBAR Transfers**

### **Simple Transfer**

```javascript
const { TransferTransaction, Hbar } = require('@hashgraph/sdk');

async function transferHbar(fromAccount, toAccount, amount) {
    const transaction = await new TransferTransaction()
        .addHbarTransfer(fromAccount, Hbar.fromTinybars(-amount)) // Negative for sender
        .addHbarTransfer(toAccount, Hbar.fromTinybars(amount))    // Positive for receiver
        .execute(client);

    const receipt = await transaction.getReceipt(client);
    
    console.log('Transfer status:', receipt.status.toString());
    console.log('Transaction ID:', transaction.transactionId.toString());

    return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: transaction.transactionId.toString()
    };
}

// Usage
await transferHbar('0.0.123456', '0.0.789012', 100000000); // 1 HBAR in tinybars
```

### **Multi-Party Transfer**

```javascript
async function multiPartyTransfer() {
    const transaction = await new TransferTransaction()
        .addHbarTransfer('0.0.sender1', Hbar.from(-10))    // -10 HBAR
        .addHbarTransfer('0.0.sender2', Hbar.from(-5))     // -5 HBAR
        .addHbarTransfer('0.0.receiver1', Hbar.from(7))    // +7 HBAR
        .addHbarTransfer('0.0.receiver2', Hbar.from(8))    // +8 HBAR
        .execute(client);

    const receipt = await transaction.getReceipt(client);
    return receipt.status.toString() === 'SUCCESS';
}
```

---

## 🪙 **Token Operations**

### **Creating Fungible Tokens**

```javascript
const {
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    Hbar
} = require('@hashgraph/sdk');

async function createFungibleToken() {
    // Create supply key for minting
    const supplyKey = PrivateKey.generateED25519();

    const transaction = await new TokenCreateTransaction()
        .setTokenName('SafeMate Token')
        .setTokenSymbol('SMT')
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(1000000) // 10,000.00 SMT
        .setTreasuryAccountId(client.operatorAccountId)
        .setSupplyType(TokenSupplyType.Infinite)
        .setSupplyKey(supplyKey)
        .setAdminKey(client.operatorPublicKey)
        .execute(client);

    const receipt = await transaction.getReceipt(client);
    const tokenId = receipt.tokenId;

    console.log('Created token:', tokenId.toString());
    return tokenId;
}
```

### **Creating NFTs (Like SafeMate User Guide)**

```javascript
const { TokenCreateTransaction, TokenType, TokenSupplyType } = require('@hashgraph/sdk');

async function createUserGuideNFT() {
    const supplyKey = PrivateKey.generateED25519();
    const adminKey = PrivateKey.generateED25519();
    const metadataKey = PrivateKey.generateED25519();

    const transaction = await new TokenCreateTransaction()
        .setTokenName('SafeMate User Guide')
        .setTokenSymbol('SMUG')
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setMaxSupply(10000)
        .setTreasuryAccountId(client.operatorAccountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setSupplyKey(supplyKey)
        .setAdminKey(adminKey)
        .setMetadataKey(metadataKey) // Allows updating NFT metadata
        .setTokenMemo('Interactive user guide NFT for SafeMate platform')
        .execute(client);

    const receipt = await transaction.getReceipt(client);
    const tokenId = receipt.tokenId;

    console.log('Created NFT collection:', tokenId.toString());

    return {
        tokenId,
        supplyKey: supplyKey.toString(),
        adminKey: adminKey.toString(),
        metadataKey: metadataKey.toString()
    };
}
```

### **Minting NFTs**

```javascript
const { TokenMintTransaction } = require('@hashgraph/sdk');

async function mintUserGuideNFT(tokenId, supplyKey, userMetadata) {
    const metadata = JSON.stringify({
        name: 'SafeMate User Guide',
        description: 'Personal interactive guide to SafeMate platform',
        image: 'https://safemate.com/images/user-guide-nft.png',
        version: '1.0.0',
        created: new Date().toISOString(),
        content: {
            sections: [
                { id: 'getting-started', title: 'Getting Started', completed: false },
                { id: 'wallet-basics', title: 'Wallet Basics', completed: false },
                { id: 'file-sharing', title: 'File Sharing', completed: false }
            ]
        },
        personalization: userMetadata || {
            userName: 'New User',
            completedSections: [],
            preferences: {}
        }
    });

    const transaction = await new TokenMintTransaction()
        .setTokenId(tokenId)
        .setMetadata([Buffer.from(metadata)])
        .freezeWith(client)
        .sign(PrivateKey.fromString(supplyKey));

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    console.log('Minted NFT with serial:', receipt.serials[0].toString());

    return {
        tokenId: tokenId.toString(),
        serialNumber: receipt.serials[0].toString(),
        transactionId: response.transactionId.toString()
    };
}
```

### **Updating NFT Metadata**

```javascript
const { TokenUpdateNftsTransaction } = require('@hashgraph/sdk');

async function updateUserGuideProgress(tokenId, serialNumber, metadataKey, progressUpdate) {
    // Get current metadata first
    const currentMetadata = await getNFTMetadata(tokenId, serialNumber);
    
    // Update progress
    const updatedMetadata = {
        ...currentMetadata,
        version: incrementVersion(currentMetadata.version),
        updated: new Date().toISOString(),
        personalization: {
            ...currentMetadata.personalization,
            ...progressUpdate
        }
    };

    const transaction = await new TokenUpdateNftsTransaction()
        .setTokenId(tokenId)
        .setSerialNumbers([serialNumber])
        .setMetadata(Buffer.from(JSON.stringify(updatedMetadata)))
        .freezeWith(client)
        .sign(PrivateKey.fromString(metadataKey));

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    return receipt.status.toString() === 'SUCCESS';
}
```

### **Token Association**

```javascript
const { TokenAssociateTransaction } = require('@hashgraph/sdk');

async function associateToken(accountId, tokenId, accountPrivateKey) {
    const transaction = await new TokenAssociateTransaction()
        .setAccountId(accountId)
        .setTokenIds([tokenId])
        .freezeWith(client)
        .sign(PrivateKey.fromString(accountPrivateKey));

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    console.log('Token association status:', receipt.status.toString());
    return receipt.status.toString() === 'SUCCESS';
}
```

### **Token Transfer**

```javascript
async function transferNFT(tokenId, serialNumber, fromAccount, toAccount, fromPrivateKey) {
    const transaction = await new TransferTransaction()
        .addNftTransfer(tokenId, serialNumber, fromAccount, toAccount)
        .freezeWith(client)
        .sign(PrivateKey.fromString(fromPrivateKey));

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    return {
        success: receipt.status.toString() === 'SUCCESS',
        transactionId: response.transactionId.toString()
    };
}
```

---

## 📊 **Queries**

### **Token Info Query**

```javascript
const { TokenInfoQuery } = require('@hashgraph/sdk');

async function getTokenInfo(tokenId) {
    const info = await new TokenInfoQuery()
        .setTokenId(tokenId)
        .execute(client);

    console.log('Token Info:');
    console.log('ID:', info.tokenId.toString());
    console.log('Name:', info.name);
    console.log('Symbol:', info.symbol);
    console.log('Decimals:', info.decimals);
    console.log('Total Supply:', info.totalSupply.toString());
    console.log('Treasury Account:', info.treasuryAccountId.toString());
    console.log('Admin Key:', info.adminKey?.toString() || 'None');
    console.log('Supply Key:', info.supplyKey?.toString() || 'None');
    console.log('Freeze Key:', info.freezeKey?.toString() || 'None');
    console.log('Wipe Key:', info.wipeKey?.toString() || 'None');
    console.log('KYC Key:', info.kycKey?.toString() || 'None');
    console.log('Pause Key:', info.pauseKey?.toString() || 'None');

    return info;
}
```

### **NFT Info Query**

```javascript
const { TokenNftInfoQuery } = require('@hashgraph/sdk');

async function getNFTInfo(tokenId, serialNumber) {
    const info = await new TokenNftInfoQuery()
        .setTokenId(tokenId)
        .setSerialNumber(serialNumber)
        .execute(client);

    console.log('NFT Info:');
    console.log('Token ID:', info.tokenId.toString());
    console.log('Serial Number:', info.serialNumber.toString());
    console.log('Account ID:', info.accountId.toString());
    console.log('Creation Time:', new Date(info.creationTime.seconds * 1000));
    console.log('Metadata:', info.metadata ? Buffer.from(info.metadata).toString() : 'None');

    return {
        tokenId: info.tokenId.toString(),
        serialNumber: info.serialNumber.toString(),
        owner: info.accountId.toString(),
        metadata: info.metadata ? JSON.parse(Buffer.from(info.metadata).toString()) : null,
        creationTime: new Date(info.creationTime.seconds * 1000)
    };
}
```

### **Transaction History**

```javascript
const { AccountRecordsQuery } = require('@hashgraph/sdk');

async function getAccountTransactions(accountId) {
    const records = await new AccountRecordsQuery()
        .setAccountId(accountId)
        .setMaxQueryPayment(Hbar.fromTinybars(100000))
        .execute(client);

    console.log(`Found ${records.length} transactions`);

    records.forEach((record, index) => {
        console.log(`Transaction ${index + 1}:`);
        console.log('  ID:', record.transactionId.toString());
        console.log('  Consensus Timestamp:', new Date(record.consensusTimestamp.seconds * 1000));
        console.log('  Transaction Fee:', record.transactionFee.toString());
        console.log('  Transfers:', record.transfers.toString());
    });

    return records;
}
```

---

## 🔗 **Advanced Features**

### **Scheduled Transactions**

```javascript
const { ScheduleCreateTransaction, TransferTransaction } = require('@hashgraph/sdk');

async function createScheduledTransfer(fromAccount, toAccount, amount, scheduleKey) {
    // Create the inner transaction
    const innerTransaction = new TransferTransaction()
        .addHbarTransfer(fromAccount, Hbar.fromTinybars(-amount))
        .addHbarTransfer(toAccount, Hbar.fromTinybars(amount));

    // Create scheduled transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
        .setScheduledTransaction(innerTransaction)
        .setScheduleMemo('SafeMate scheduled transfer')
        .setAdminKey(scheduleKey)
        .execute(client);

    const receipt = await scheduleTransaction.getReceipt(client);
    const scheduleId = receipt.scheduleId;

    console.log('Created scheduled transaction:', scheduleId.toString());
    return scheduleId;
}
```

### **Multi-Signature Transactions**

```javascript
async function multiSigTransaction(tokenId, serialNumber, fromAccount, toAccount, signerKeys) {
    // Create transaction
    let transaction = new TransferTransaction()
        .addNftTransfer(tokenId, serialNumber, fromAccount, toAccount)
        .freezeWith(client);

    // Sign with multiple keys
    for (const key of signerKeys) {
        transaction = transaction.sign(PrivateKey.fromString(key));
    }

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);

    return receipt.status.toString() === 'SUCCESS';
}
```

### **Consensus Service**

```javascript
const { TopicCreateTransaction, TopicMessageSubmitTransaction } = require('@hashgraph/sdk');

async function createMessageTopic(memo) {
    const transaction = await new TopicCreateTransaction()
        .setTopicMemo(memo)
        .setAdminKey(client.operatorPublicKey)
        .setSubmitKey(client.operatorPublicKey)
        .execute(client);

    const receipt = await transaction.getReceipt(client);
    const topicId = receipt.topicId;

    console.log('Created topic:', topicId.toString());
    return topicId;
}

async function submitMessage(topicId, message) {
    const transaction = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message)
        .execute(client);

    const receipt = await transaction.getReceipt(client);
    return receipt.status.toString() === 'SUCCESS';
}
```

---

## 🛠️ **SafeMate Integration Examples**

### **Complete User Onboarding Flow**

```javascript
class SafeMateHederaService {
    constructor() {
        this.client = Client.forTestnet().setOperator(
            AccountId.fromString(process.env.HEDERA_OPERATOR_ID),
            PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
        );
    }

    async createUserWallet(userId) {
        try {
            // Generate keys for user
            const privateKey = PrivateKey.generateED25519();
            const publicKey = privateKey.getPublicKey();
            const accountAlias = `alias-${publicKey.toStringRaw()}`;

            console.log(`Creating wallet for user ${userId}`);
            console.log(`Account alias: ${accountAlias}`);

            return {
                userId,
                accountAlias,
                privateKey: privateKey.toString(),
                publicKey: publicKey.toString(),
                needsFunding: true,
                fundingInstructions: 'Send at least 0.1 HBAR to activate this account'
            };

        } catch (error) {
            console.error('Error creating wallet:', error);
            throw error;
        }
    }

    async transferUserGuideNFT(userAccountId, userPrivateKey, nftTokenId, serialNumber) {
        try {
            // Step 1: Associate token with user account
            const userKey = PrivateKey.fromString(userPrivateKey);
            
            const associateTransaction = await new TokenAssociateTransaction()
                .setAccountId(userAccountId)
                .setTokenIds([nftTokenId])
                .freezeWith(this.client)
                .sign(userKey);

            const associateResponse = await associateTransaction.execute(this.client);
            await associateResponse.getReceipt(this.client);

            console.log('Token associated with user account');

            // Step 2: Transfer NFT from treasury to user
            const transferTransaction = await new TransferTransaction()
                .addNftTransfer(
                    nftTokenId,
                    serialNumber,
                    this.client.operatorAccountId, // From treasury
                    userAccountId                   // To user
                )
                .execute(this.client);

            const transferReceipt = await transferTransaction.getReceipt(this.client);

            console.log('NFT transferred to user');

            return {
                success: true,
                transactionId: transferTransaction.transactionId.toString(),
                tokenId: nftTokenId.toString(),
                serialNumber: serialNumber.toString(),
                newOwner: userAccountId.toString()
            };

        } catch (error) {
            console.error('Error transferring NFT:', error);
            throw error;
        }
    }

    async updateUserProgress(tokenId, serialNumber, metadataKey, progressData) {
        try {
            // Get current NFT metadata
            const nftInfo = await this.getNFTInfo(tokenId, serialNumber);
            const currentMetadata = nftInfo.metadata;

            // Update progress
            const updatedMetadata = {
                ...currentMetadata,
                version: this.incrementVersion(currentMetadata.version),
                updated: new Date().toISOString(),
                personalization: {
                    ...currentMetadata.personalization,
                    completedSections: progressData.completedSections,
                    lastAccessed: new Date().toISOString()
                }
            };

            // Update NFT metadata
            const updateTransaction = await new TokenUpdateNftsTransaction()
                .setTokenId(tokenId)
                .setSerialNumbers([serialNumber])
                .setMetadata(Buffer.from(JSON.stringify(updatedMetadata)))
                .freezeWith(this.client)
                .sign(PrivateKey.fromString(metadataKey));

            const response = await updateTransaction.execute(this.client);
            const receipt = await response.getReceipt(this.client);

            return {
                success: receipt.status.toString() === 'SUCCESS',
                newVersion: updatedMetadata.version,
                transactionId: response.transactionId.toString()
            };

        } catch (error) {
            console.error('Error updating user progress:', error);
            throw error;
        }
    }

    incrementVersion(currentVersion) {
        const [major, minor, patch] = currentVersion.split('.').map(Number);
        return `${major}.${minor}.${patch + 1}`;
    }

    async getNFTInfo(tokenId, serialNumber) {
        const info = await new TokenNftInfoQuery()
            .setTokenId(tokenId)
            .setSerialNumber(serialNumber)
            .execute(this.client);

        return {
            tokenId: info.tokenId.toString(),
            serialNumber: info.serialNumber.toString(),
            owner: info.accountId.toString(),
            metadata: info.metadata ? JSON.parse(Buffer.from(info.metadata).toString()) : null,
            creationTime: new Date(info.creationTime.seconds * 1000)
        };
    }
}
```

### **Price Monitoring Service**

```javascript
class HederaTokenMonitor {
    constructor() {
        this.client = Client.forTestnet();
    }

    async monitorTokenBalances(accountIds, tokenIds) {
        const results = [];

        for (const accountId of accountIds) {
            try {
                const balance = await new AccountBalanceQuery()
                    .setAccountId(accountId)
                    .execute(this.client);

                const tokenBalances = {};
                for (const tokenId of tokenIds) {
                    const tokenBalance = balance.tokens.get(tokenId);
                    tokenBalances[tokenId.toString()] = tokenBalance ? tokenBalance.toString() : '0';
                }

                results.push({
                    accountId: accountId.toString(),
                    hbarBalance: balance.hbars.toString(),
                    tokenBalances,
                    timestamp: new Date().toISOString()
                });

            } catch (error) {
                console.error(`Error checking balance for ${accountId}:`, error);
                results.push({
                    accountId: accountId.toString(),
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        }

        return results;
    }
}
```

---

## 🚨 **Error Handling**

### **Common Errors and Solutions**

```javascript
const { Status } = require('@hashgraph/sdk');

async function executeTransactionWithRetry(transaction, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await transaction.execute(client);
            const receipt = await response.getReceipt(client);
            
            if (receipt.status === Status.Success) {
                return { success: true, receipt, response };
            }
            
            throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
            
        } catch (error) {
            console.warn(`Attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Handle specific errors
            if (error.message.includes('INSUFFICIENT_ACCOUNT_BALANCE')) {
                throw new Error('Insufficient HBAR balance to execute transaction');
            }
            
            if (error.message.includes('INVALID_SIGNATURE')) {
                throw new Error('Invalid signature - check private key');
            }
            
            if (error.message.includes('TOKEN_NOT_ASSOCIATED_TO_ACCOUNT')) {
                throw new Error('Token must be associated with account first');
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
    }
}
```

### **Network Error Handling**

```javascript
function createRobustClient() {
    const client = Client.forTestnet();
    
    // Set network with multiple nodes for redundancy
    client.setNetwork({
        "0.testnet.hedera.com:50211": AccountId.fromString("0.0.3"),
        "1.testnet.hedera.com:50211": AccountId.fromString("0.0.4"),
        "2.testnet.hedera.com:50211": AccountId.fromString("0.0.5")
    });
    
    // Set request timeout
    client.setRequestTimeout(30000); // 30 seconds
    
    return client;
}
```

---

## ⚡ **Performance Optimization**

### **Connection Management**

```javascript
// Singleton pattern for client management
class HederaClientManager {
    static instance = null;
    
    static getInstance() {
        if (!this.instance) {
            this.instance = new HederaClientManager();
        }
        return this.instance;
    }
    
    constructor() {
        this.client = null;
        this.initializeClient();
    }
    
    initializeClient() {
        this.client = Client.forTestnet().setOperator(
            AccountId.fromString(process.env.HEDERA_OPERATOR_ID),
            PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY)
        );
        
        // Set reasonable timeouts
        this.client.setRequestTimeout(30000);
        this.client.setGrpcDeadline(60000);
    }
    
    getClient() {
        return this.client;
    }
}
```

### **Batch Operations**

```javascript
async function batchMintNFTs(tokenId, supplyKey, metadataArray) {
    const results = [];
    const batchSize = 10; // Hedera limit
    
    for (let i = 0; i < metadataArray.length; i += batchSize) {
        const batch = metadataArray.slice(i, i + batchSize);
        
        try {
            const transaction = await new TokenMintTransaction()
                .setTokenId(tokenId)
                .setMetadata(batch.map(meta => Buffer.from(JSON.stringify(meta))))
                .freezeWith(client)
                .sign(PrivateKey.fromString(supplyKey));
            
            const response = await transaction.execute(client);
            const receipt = await response.getReceipt(client);
            
            results.push({
                success: true,
                serials: receipt.serials.map(s => s.toString()),
                transactionId: response.transactionId.toString()
            });
            
        } catch (error) {
            console.error(`Batch ${Math.floor(i/batchSize) + 1} failed:`, error);
            results.push({
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}
```

---

## 🧪 **Testing**

### **Unit Testing with Jest**

```javascript
// tests/hedera.test.js
const { Client, PrivateKey, AccountId } = require('@hashgraph/sdk');

describe('Hedera SDK Integration', () => {
    let client;
    
    beforeAll(() => {
        client = Client.forTestnet();
        // Use test credentials
        client.setOperator(
            AccountId.fromString('0.0.123456'),
            PrivateKey.fromString('test-private-key')
        );
    });
    
    afterAll(() => {
        client.close();
    });
    
    test('should create account alias', () => {
        const privateKey = PrivateKey.generateED25519();
        const publicKey = privateKey.getPublicKey();
        const alias = `alias-${publicKey.toStringRaw()}`;
        
        expect(alias).toMatch(/^alias-[a-f0-9]{64}$/);
        expect(privateKey.toString()).toMatch(/^302e020100300506032b657004220420[a-f0-9]{64}$/);
    });
    
    test('should validate account ID format', () => {
        const validIds = ['0.0.123', '0.0.123456', '0.0.999999'];
        const invalidIds = ['123', '0.123', 'invalid'];
        
        validIds.forEach(id => {
            expect(() => AccountId.fromString(id)).not.toThrow();
        });
        
        invalidIds.forEach(id => {
            expect(() => AccountId.fromString(id)).toThrow();
        });
    });
});
```

---

## 📋 **Best Practices Checklist**

### **✅ Security**
- [ ] Store private keys securely (AWS Secrets Manager)
- [ ] Never log private keys
- [ ] Use environment variables for sensitive config
- [ ] Validate all inputs before creating transactions
- [ ] Use least privilege principle for keys

### **✅ Performance**
- [ ] Reuse client connections
- [ ] Implement proper timeout handling
- [ ] Use batch operations when possible
- [ ] Cache frequently accessed data
- [ ] Monitor network latency

### **✅ Error Handling**
- [ ] Implement retry logic for network errors
- [ ] Handle specific Hedera error codes
- [ ] Log errors with sufficient context
- [ ] Provide user-friendly error messages
- [ ] Set up alerting for critical failures

### **✅ Monitoring**
- [ ] Track transaction success rates
- [ ] Monitor account balances
- [ ] Log all important operations
- [ ] Set up dashboards for key metrics
- [ ] Monitor network performance

This comprehensive Hedera SDK guide covers everything you need to build robust blockchain applications with SafeMate!