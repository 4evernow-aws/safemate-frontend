# Hedera Wallet Creation Complete Guide

## 🎯 **Overview of Hedera Wallet Creation**

This guide covers all methods for creating Hedera wallets, from simple key generation to advanced auto-creation patterns used in SafeMate.

---

## 🔑 **Key Generation Fundamentals**

### **Ed25519 vs ECDSA**

Hedera supports two cryptographic algorithms:

```javascript
const { PrivateKey } = require('@hashgraph/sdk');

// Ed25519 (Recommended - faster, smaller signatures)
const ed25519Key = PrivateKey.generateED25519();
console.log('Ed25519 Private Key:', ed25519Key.toString());
console.log('Ed25519 Public Key:', ed25519Key.getPublicKey().toString());

// ECDSA (Compatible with Ethereum)
const ecdsaKey = PrivateKey.generateECDSA();
console.log('ECDSA Private Key:', ecdsaKey.toString());
console.log('ECDSA Public Key:', ecdsaKey.getPublicKey().toString());
```

### **Key Formats**

```javascript
// DER Encoded (Default Hedera format)
const privateKey = PrivateKey.generateED25519();
console.log('DER Format:', privateKey.toString());
// Output: 302e020100300506032b657004220420a74b2a24706db9034445e6e03a0f3fd7...

// Raw Bytes (64 hex characters for Ed25519)
console.log('Raw Format:', privateKey.toStringRaw());
// Output: a74b2a24706db9034445e6e03a0f3fd7a82a926f6c4a95bc5de9a720d453f9f9

// Public Key formats
const publicKey = privateKey.getPublicKey();
console.log('Public DER:', publicKey.toString());
console.log('Public Raw:', publicKey.toStringRaw());
```

---

## 🏗️ **Wallet Creation Methods**

### **Method 1: Traditional Account Creation**

**Use Case**: When you have an operator account with HBAR

```javascript
const {
    Client,
    AccountCreateTransaction,
    PrivateKey,
    Hbar
} = require('@hashgraph/sdk');

async function createTraditionalWallet() {
    // Set up client with operator account
    const client = Client.forTestnet().setOperator(
        '0.0.123456', // Your funded operator account
        'your-operator-private-key'
    );

    try {
        // Generate new wallet keys
        const newWalletPrivateKey = PrivateKey.generateED25519();
        const newWalletPublicKey = newWalletPrivateKey.getPublicKey();

        console.log('🔑 Generated wallet keys');
        console.log('Private Key:', newWalletPrivateKey.toString());
        console.log('Public Key:', newWalletPublicKey.toString());

        // Create account transaction
        const accountCreateTx = await new AccountCreateTransaction()
            .setKey(newWalletPublicKey)
            .setInitialBalance(Hbar.fromTinybars(100000000)) // 1 HBAR
            .setMaxAutomaticTokenAssociations(100) // Allow token associations
            .setAccountMemo('SafeMate wallet created via traditional method')
            .execute(client);

        // Get the receipt
        const receipt = await accountCreateTx.getReceipt(client);
        const newAccountId = receipt.accountId;

        console.log('✅ Account created successfully!');
        console.log('Account ID:', newAccountId.toString());

        return {
            accountId: newAccountId.toString(),
            privateKey: newWalletPrivateKey.toString(),
            publicKey: newWalletPublicKey.toString(),
            balance: '1.0 HBAR',
            method: 'traditional',
            transactionId: accountCreateTx.transactionId.toString()
        };

    } catch (error) {
        console.error('❌ Error creating wallet:', error);
        throw error;
    } finally {
        client.close();
    }
}
```

### **Method 2: Auto Account Creation (SafeMate Method)**

**Use Case**: When users create their own wallets without operator

```javascript
async function createAutoWallet(userId) {
    try {
        console.log(`🚀 Creating auto wallet for user: ${userId}`);

        // Generate Ed25519 key pair
        const privateKey = PrivateKey.generateED25519();
        const publicKey = privateKey.getPublicKey();

        // Create account alias from public key
        const accountAlias = `alias-${publicKey.toStringRaw()}`;

        console.log('🔑 Generated wallet credentials');
        console.log('Account Alias:', accountAlias);
        console.log('Private Key:', privateKey.toString());
        console.log('Public Key:', publicKey.toString());

        // Return wallet info (account not active until funded)
        return {
            userId: userId,
            accountAlias: accountAlias,
            privateKey: privateKey.toString(),
            publicKey: publicKey.toString(),
            isActive: false,
            needsFunding: true,
            method: 'auto_creation',
            fundingInstructions: {
                message: 'Send HBAR to the account alias to activate',
                minimumAmount: '0.001 HBAR',
                recommendedAmount: '0.1 HBAR',
                alias: accountAlias
            }
        };

    } catch (error) {
        console.error('❌ Error creating auto wallet:', error);
        throw error;
    }
}
```

### **Method 3: Hierarchical Deterministic (HD) Wallets**

**Use Case**: Generate multiple wallets from a single seed

```javascript
const crypto = require('crypto');

class HDWalletGenerator {
    constructor(seedPhrase) {
        this.seed = crypto.createHash('sha256').update(seedPhrase).digest();
    }

    generateWallet(index = 0) {
        // Create deterministic private key from seed + index
        const derivationPath = Buffer.from(`m/44'/3030'/${index}'/0/0`, 'utf8');
        const keyMaterial = crypto.createHmac('sha512', this.seed)
            .update(derivationPath)
            .digest();

        // Use first 32 bytes as private key material
        const privateKeyBytes = keyMaterial.slice(0, 32);
        
        // Create Hedera private key
        const privateKey = PrivateKey.fromBytes(privateKeyBytes);
        const publicKey = privateKey.getPublicKey();
        const accountAlias = `alias-${publicKey.toStringRaw()}`;

        return {
            index: index,
            accountAlias: accountAlias,
            privateKey: privateKey.toString(),
            publicKey: publicKey.toString(),
            derivationPath: `m/44'/3030'/${index}'/0/0`
        };
    }

    generateMultipleWallets(count = 5) {
        const wallets = [];
        for (let i = 0; i < count; i++) {
            wallets.push(this.generateWallet(i));
        }
        return wallets;
    }
}

// Usage
const hdWallet = new HDWalletGenerator('SafeMate secure seed phrase 2024');
const wallet1 = hdWallet.generateWallet(0); // First wallet
const wallet2 = hdWallet.generateWallet(1); // Second wallet
```

---

## 🔐 **Security Patterns**

### **Secure Key Storage**

```javascript
// AWS Secrets Manager integration
const { SecretsManagerClient, CreateSecretCommand, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

class SecureWalletStorage {
    constructor(region = 'ap-southeast-2') {
        this.secretsClient = new SecretsManagerClient({ region });
    }

    async storeWalletSecurely(userId, walletData) {
        const secretName = `safemate/user/${userId}/wallet`;
        
        try {
            const command = new CreateSecretCommand({
                Name: secretName,
                Description: `Secure wallet storage for SafeMate user ${userId}`,
                SecretString: JSON.stringify({
                    accountAlias: walletData.accountAlias,
                    privateKey: walletData.privateKey,
                    publicKey: walletData.publicKey,
                    createdAt: new Date().toISOString(),
                    method: walletData.method || 'auto_creation'
                }),
                Tags: [
                    { Key: 'Application', Value: 'SafeMate' },
                    { Key: 'UserId', Value: userId },
                    { Key: 'Type', Value: 'WalletCredentials' }
                ]
            });

            const response = await this.secretsClient.send(command);
            
            console.log('✅ Wallet stored securely in AWS Secrets Manager');
            return {
                success: true,
                secretArn: response.ARN,
                secretName: secretName
            };

        } catch (error) {
            console.error('❌ Error storing wallet:', error);
            throw error;
        }
    }

    async retrieveWallet(userId) {
        const secretName = `safemate/user/${userId}/wallet`;
        
        try {
            const command = new GetSecretValueCommand({
                SecretId: secretName
            });

            const response = await this.secretsClient.send(command);
            const walletData = JSON.parse(response.SecretString);

            console.log('✅ Wallet retrieved successfully');
            return walletData;

        } catch (error) {
            console.error('❌ Error retrieving wallet:', error);
            throw error;
        }
    }
}
```

### **Client-Side Key Generation (Browser)**

```javascript
// For React applications - never send private keys to server
class ClientSideWalletGenerator {
    static generateWallet() {
        // This runs in the browser - private key never leaves client
        const privateKey = PrivateKey.generateED25519();
        const publicKey = privateKey.getPublicKey();
        const accountAlias = `alias-${publicKey.toStringRaw()}`;

        // Store in browser's secure storage
        this.storeInBrowser({
            accountAlias,
            privateKey: privateKey.toString(),
            publicKey: publicKey.toString()
        });

        // Send only public information to server
        return {
            accountAlias,
            publicKey: publicKey.toString(),
            // NEVER send privateKey to server
        };
    }

    static storeInBrowser(walletData) {
        // Use browser's secure storage
        const encrypted = this.encryptWalletData(walletData, this.getUserPassphrase());
        localStorage.setItem('safemate_wallet', encrypted);
    }

    static retrieveFromBrowser() {
        const encrypted = localStorage.getItem('safemate_wallet');
        if (!encrypted) return null;

        return this.decryptWalletData(encrypted, this.getUserPassphrase());
    }

    static encryptWalletData(data, passphrase) {
        // Use Web Crypto API for encryption
        // Implementation would use AES-GCM with passphrase-derived key
        return btoa(JSON.stringify(data)); // Simplified example
    }

    static decryptWalletData(encryptedData, passphrase) {
        // Use Web Crypto API for decryption
        return JSON.parse(atob(encryptedData)); // Simplified example
    }
}
```

---

## 🌐 **Multi-Network Wallet Creation**

### **Testnet vs Mainnet Wallets**

```javascript
class HederaWalletManager {
    constructor(network = 'testnet') {
        this.network = network;
        this.client = network === 'mainnet' 
            ? Client.forMainnet() 
            : Client.forTestnet();
    }

    async createWalletForNetwork(userId, operatorCredentials = null) {
        try {
            if (operatorCredentials && operatorCredentials.accountId) {
                // Traditional creation with operator
                return await this.createWithOperator(userId, operatorCredentials);
            } else {
                // Auto creation without operator
                return await this.createAutoWallet(userId);
            }

        } catch (error) {
            console.error(`❌ Error creating ${this.network} wallet:`, error);
            throw error;
        }
    }

    async createWithOperator(userId, operatorCredentials) {
        this.client.setOperator(
            operatorCredentials.accountId,
            operatorCredentials.privateKey
        );

        const newWalletKey = PrivateKey.generateED25519();
        
        const accountCreateTx = await new AccountCreateTransaction()
            .setKey(newWalletKey.getPublicKey())
            .setInitialBalance(Hbar.fromTinybars(this.getInitialBalance()))
            .setAccountMemo(`SafeMate ${this.network} wallet for user ${userId}`)
            .execute(this.client);

        const receipt = await accountCreateTx.getReceipt(this.client);

        return {
            network: this.network,
            accountId: receipt.accountId.toString(),
            privateKey: newWalletKey.toString(),
            publicKey: newWalletKey.getPublicKey().toString(),
            initialBalance: this.getInitialBalance(),
            method: 'operator_creation'
        };
    }

    async createAutoWallet(userId) {
        const privateKey = PrivateKey.generateED25519();
        const publicKey = privateKey.getPublicKey();
        const accountAlias = `alias-${publicKey.toStringRaw()}`;

        return {
            network: this.network,
            accountAlias: accountAlias,
            privateKey: privateKey.toString(),
            publicKey: publicKey.toString(),
            method: 'auto_creation',
            needsFunding: true,
            minimumFunding: this.getMinimumFunding()
        };
    }

    getInitialBalance() {
        return this.network === 'mainnet' ? 50000000 : 100000000; // 0.5 or 1 HBAR
    }

    getMinimumFunding() {
        return this.network === 'mainnet' ? 1000000 : 100000; // 0.01 or 0.001 HBAR
    }
}

// Usage
const testnetWalletManager = new HederaWalletManager('testnet');
const mainnetWalletManager = new HederaWalletManager('mainnet');

// Create testnet wallet (for development)
const testWallet = await testnetWalletManager.createAutoWallet('user123');

// Create mainnet wallet (for production)
const prodWallet = await mainnetWalletManager.createAutoWallet('user123');
```

---

## 🔄 **Wallet Activation Process**

### **Account Activation Detection**

```javascript
class WalletActivationMonitor {
    constructor(network = 'testnet') {
        this.client = network === 'mainnet' 
            ? Client.forMainnet() 
            : Client.forTestnet();
    }

    async checkAccountActivation(accountAlias) {
        try {
            // Try to query the account balance
            const balance = await new AccountBalanceQuery()
                .setAccountId(accountAlias)
                .execute(this.client);

            // If successful, account is activated
            return {
                isActivated: true,
                accountId: balance.accountId?.toString() || accountAlias,
                hbarBalance: balance.hbars.toString(),
                tokenBalances: this.formatTokenBalances(balance.tokens),
                activatedAt: new Date().toISOString()
            };

        } catch (error) {
            // If query fails, account likely not activated
            if (error.message.includes('INVALID_ACCOUNT_ID')) {
                return {
                    isActivated: false,
                    accountAlias: accountAlias,
                    error: 'Account not yet activated - needs HBAR funding',
                    requiredAction: 'Send HBAR to activate account'
                };
            }
            throw error;
        }
    }

    async waitForActivation(accountAlias, maxWaitTime = 300000, checkInterval = 10000) {
        const startTime = Date.now();
        
        console.log(`⏳ Waiting for account activation: ${accountAlias}`);
        
        while (Date.now() - startTime < maxWaitTime) {
            try {
                const status = await this.checkAccountActivation(accountAlias);
                
                if (status.isActivated) {
                    console.log('✅ Account activated successfully!');
                    return status;
                }
                
                console.log(`⏳ Still waiting... (${Math.floor((Date.now() - startTime) / 1000)}s)`);
                await this.sleep(checkInterval);
                
            } catch (error) {
                console.warn('⚠️ Error checking activation:', error.message);
                await this.sleep(checkInterval);
            }
        }
        
        throw new Error('Account activation timeout - please check funding');
    }

    formatTokenBalances(tokensMap) {
        const balances = {};
        if (tokensMap && tokensMap._map) {
            for (const [tokenId, balance] of tokensMap._map) {
                balances[tokenId.toString()] = balance.toString();
            }
        }
        return balances;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

### **Automated Activation Workflow**

```javascript
class SafeMateWalletService {
    constructor() {
        this.activationMonitor = new WalletActivationMonitor();
        this.storage = new SecureWalletStorage();
    }

    async createAndMonitorWallet(userId) {
        try {
            // Step 1: Generate wallet
            const wallet = await createAutoWallet(userId);
            
            console.log(`📱 Wallet created for user ${userId}`);
            console.log(`💸 Send HBAR to: ${wallet.accountAlias}`);

            // Step 2: Store wallet securely
            await this.storage.storeWalletSecurely(userId, wallet);

            // Step 3: Start monitoring for activation (non-blocking)
            this.monitorActivationAsync(userId, wallet.accountAlias);

            // Step 4: Return wallet info to user
            return {
                success: true,
                userId: userId,
                accountAlias: wallet.accountAlias,
                publicKey: wallet.publicKey,
                // Don't return private key
                needsFunding: true,
                instructions: {
                    step1: 'Copy your account alias',
                    step2: 'Send 0.1+ HBAR to the alias using HashPack or another wallet',
                    step3: 'Wait for confirmation (usually 1-3 minutes)',
                    step4: 'Your SafeMate wallet will be ready!'
                }
            };

        } catch (error) {
            console.error('❌ Error in wallet creation workflow:', error);
            throw error;
        }
    }

    async monitorActivationAsync(userId, accountAlias) {
        try {
            // Monitor activation in background
            const activationResult = await this.activationMonitor.waitForActivation(accountAlias);
            
            if (activationResult.isActivated) {
                // Notify user of activation
                await this.notifyWalletActivated(userId, activationResult);
                
                // Trigger any post-activation tasks
                await this.handlePostActivation(userId, activationResult);
            }

        } catch (error) {
            console.error(`❌ Activation monitoring failed for user ${userId}:`, error);
            await this.notifyActivationFailed(userId, error.message);
        }
    }

    async handlePostActivation(userId, activationResult) {
        console.log(`🎉 Post-activation tasks for user ${userId}`);
        
        // Update user wallet status in database
        await this.updateWalletStatus(userId, 'activated', activationResult);
        
        // Transfer user guide NFT (if using NFT system)
        // await this.transferUserGuideNFT(userId, activationResult.accountId);
        
        // Send welcome message
        // await this.sendWelcomeMessage(userId);
    }

    async notifyWalletActivated(userId, activationResult) {
        console.log(`📧 Notifying user ${userId} of wallet activation`);
        // Implementation would send email, push notification, or in-app message
    }

    async notifyActivationFailed(userId, errorMessage) {
        console.log(`📧 Notifying user ${userId} of activation failure: ${errorMessage}`);
        // Implementation would send failure notification with help instructions
    }

    async updateWalletStatus(userId, status, data) {
        // Implementation would update user wallet status in your database
        console.log(`📝 Updated wallet status for ${userId}: ${status}`);
    }
}
```

---

## 🧪 **Testing Wallet Creation**

### **Unit Tests**

```javascript
// tests/wallet-creation.test.js
const { PrivateKey } = require('@hashgraph/sdk');

describe('Wallet Creation', () => {
    test('should generate valid Ed25519 key pairs', () => {
        const privateKey = PrivateKey.generateED25519();
        const publicKey = privateKey.getPublicKey();
        
        // Test key format validation
        expect(privateKey.toString()).toMatch(/^302e020100300506032b657004220420[a-f0-9]{64}$/);
        expect(publicKey.toString()).toMatch(/^302a300506032b6570032100[a-f0-9]{64}$/);
        
        // Test raw format
        expect(privateKey.toStringRaw()).toMatch(/^[a-f0-9]{64}$/);
        expect(publicKey.toStringRaw()).toMatch(/^[a-f0-9]{64}$/);
    });

    test('should create valid account alias', () => {
        const privateKey = PrivateKey.generateED25519();
        const publicKey = privateKey.getPublicKey();
        const alias = `alias-${publicKey.toStringRaw()}`;
        
        expect(alias).toMatch(/^alias-[a-f0-9]{64}$/);
        expect(alias.length).toBe(70); // 'alias-' + 64 hex chars
    });

    test('should generate unique wallets', () => {
        const wallet1 = createAutoWallet('user1');
        const wallet2 = createAutoWallet('user2');
        
        expect(wallet1.accountAlias).not.toBe(wallet2.accountAlias);
        expect(wallet1.privateKey).not.toBe(wallet2.privateKey);
        expect(wallet1.publicKey).not.toBe(wallet2.publicKey);
    });
});
```

### **Integration Tests**

```javascript
// tests/wallet-integration.test.js
describe('Wallet Integration', () => {
    let walletService;
    
    beforeEach(() => {
        walletService = new SafeMateWalletService();
    });

    test('should create and store wallet securely', async () => {
        const userId = 'test-user-' + Date.now();
        
        const result = await walletService.createAndMonitorWallet(userId);
        
        expect(result.success).toBe(true);
        expect(result.accountAlias).toMatch(/^alias-[a-f0-9]{64}$/);
        expect(result.needsFunding).toBe(true);
        
        // Verify wallet was stored
        const storedWallet = await walletService.storage.retrieveWallet(userId);
        expect(storedWallet.accountAlias).toBe(result.accountAlias);
    });

    test('should detect account activation', async () => {
        // This test requires actual HBAR funding
        const accountAlias = 'alias-test...'; // Replace with funded alias
        
        const monitor = new WalletActivationMonitor();
        const status = await monitor.checkAccountActivation(accountAlias);
        
        expect(status.isActivated).toBe(true);
        expect(status.hbarBalance).toBeDefined();
    }, 30000); // 30 second timeout
});
```

---

## 📊 **Wallet Management Dashboard**

### **Wallet Status Component**

```javascript
// React component for wallet management
import React, { useState, useEffect } from 'react';

const WalletStatusDashboard = ({ userId }) => {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activationStatus, setActivationStatus] = useState('checking');

    useEffect(() => {
        loadWalletStatus();
    }, [userId]);

    const loadWalletStatus = async () => {
        try {
            const response = await fetch(`/api/wallet/status/${userId}`);
            const walletData = await response.json();
            
            setWallet(walletData);
            
            if (walletData.needsFunding) {
                startActivationMonitoring(walletData.accountAlias);
            } else {
                setActivationStatus('activated');
            }
            
        } catch (error) {
            console.error('Error loading wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const startActivationMonitoring = (accountAlias) => {
        const checkActivation = async () => {
            try {
                const response = await fetch('/api/wallet/check-activation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accountAlias })
                });
                
                const result = await response.json();
                
                if (result.isActivated) {
                    setActivationStatus('activated');
                    setWallet(prev => ({ ...prev, needsFunding: false }));
                } else {
                    setActivationStatus('waiting');
                    setTimeout(checkActivation, 10000); // Check every 10 seconds
                }
                
            } catch (error) {
                console.error('Error checking activation:', error);
                setTimeout(checkActivation, 10000);
            }
        };
        
        checkActivation();
    };

    if (loading) {
        return <div>Loading wallet...</div>;
    }

    return (
        <div className="wallet-dashboard">
            <h2>Your SafeMate Wallet</h2>
            
            {wallet && (
                <>
                    <div className="wallet-info">
                        <p><strong>Account:</strong> {wallet.accountAlias || wallet.accountId}</p>
                        <p><strong>Status:</strong> 
                            <span className={`status ${activationStatus}`}>
                                {activationStatus === 'activated' ? '✅ Active' : 
                                 activationStatus === 'waiting' ? '⏳ Waiting for funding' : 
                                 '🔄 Checking...'}
                            </span>
                        </p>
                        
                        {wallet.hbarBalance && (
                            <p><strong>Balance:</strong> {wallet.hbarBalance} HBAR</p>
                        )}
                    </div>

                    {wallet.needsFunding && (
                        <div className="funding-instructions">
                            <h3>Activate Your Wallet</h3>
                            <ol>
                                <li>Copy your account alias: <code>{wallet.accountAlias}</code></li>
                                <li>Open HashPack or another Hedera wallet</li>
                                <li>Send 0.1+ HBAR to the account alias</li>
                                <li>Wait for activation confirmation</li>
                            </ol>
                        </div>
                    )}

                    {activationStatus === 'activated' && (
                        <div className="wallet-actions">
                            <button onClick={() => window.location.href = '/dashboard'}>
                                Access SafeMate Features
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default WalletStatusDashboard;
```

---

## 📋 **Best Practices Summary**

### **✅ Security Best Practices**
- [ ] Never store private keys in plain text
- [ ] Use AWS Secrets Manager or equivalent for key storage
- [ ] Generate keys client-side when possible
- [ ] Implement proper key rotation policies
- [ ] Use strong entropy sources for key generation

### **✅ User Experience Best Practices**
- [ ] Provide clear funding instructions
- [ ] Monitor activation status automatically
- [ ] Send notifications when wallet is ready
- [ ] Display wallet status in real-time
- [ ] Provide troubleshooting guides

### **✅ Performance Best Practices**
- [ ] Reuse client connections
- [ ] Implement caching for wallet status
- [ ] Use batch operations when possible
- [ ] Optimize activation polling frequency
- [ ] Monitor network latency

### **✅ Error Handling Best Practices**
- [ ] Handle network timeouts gracefully
- [ ] Provide meaningful error messages
- [ ] Implement retry logic for transient failures
- [ ] Log errors with sufficient context
- [ ] Set up monitoring and alerting

This comprehensive guide covers all aspects of Hedera wallet creation, from basic key generation to advanced activation monitoring - everything needed for building robust wallet functionality in SafeMate!