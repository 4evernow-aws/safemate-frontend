# AWS Lambda Complete User Guide

## 🎯 **What is AWS Lambda?**

AWS Lambda is a serverless compute service that runs your code in response to events without requiring you to provision or manage servers. You only pay for the compute time you consume - there's no charge when your code isn't running.

---

## 🏗️ **Core Concepts**

### **Function Structure**
```javascript
exports.handler = async (event, context) => {
  // event: Input data (HTTP request, S3 event, etc.)
  // context: Runtime information (timeout, memory, etc.)
  
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Hello from Lambda!' })
  };
};
```

### **Key Components**
- **Handler**: Entry point function that AWS invokes
- **Event**: Input data passed to your function
- **Context**: Runtime information and utilities
- **Runtime**: Language and version (Node.js 18.x, Python 3.9, etc.)
- **Layers**: Shared code and dependencies

---

## 🚀 **Getting Started**

### **Step 1: Create Your First Function**

1. **Open AWS Console** → Search "Lambda"
2. **Click "Create function"**
3. **Choose creation method:**
   - **Author from scratch** (most common)
   - **Use a blueprint** (templates)
   - **Container image** (custom Docker)

### **Step 2: Basic Configuration**
```
Function name: safemate-hello-world
Runtime: Node.js 18.x
Architecture: x86_64
Permissions: Create a new role with basic Lambda permissions
```

### **Step 3: Write Your Code**

**Basic Hello World:**
```javascript
exports.handler = async (event) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Hello from SafeMate Lambda!',
            timestamp: new Date().toISOString()
        })
    };
};
```

### **Step 4: Test Your Function**

1. **Click "Test"**
2. **Create new test event:**
   ```json
   {
     "queryStringParameters": {
       "name": "SafeMate"
     }
   }
   ```
3. **Click "Test"** to run

---

## 🔧 **Advanced Configuration**

### **Environment Variables**

Store configuration without hardcoding:

```javascript
// Set in Lambda console: Configuration → Environment variables
const API_URL = process.env.API_URL || 'https://default-api.com';
const DB_TABLE = process.env.DB_TABLE || 'default-table';

exports.handler = async (event) => {
    // Use environment variables
    const apiResponse = await fetch(API_URL);
    
    return {
        statusCode: 200,
        body: JSON.stringify({
            table: DB_TABLE,
            env: process.env.NODE_ENV
        })
    };
};
```

### **Memory and Timeout Configuration**

```yaml
Memory: 512 MB (128 MB - 10,240 MB)
Timeout: 30 seconds (1 second - 15 minutes)
```

**Memory affects CPU allocation:**
- 128 MB = ~0.25 vCPU
- 1,024 MB = ~1 vCPU  
- 3,008 MB = ~2 vCPU
- 10,240 MB = ~6 vCPU

### **VPC Configuration**

For accessing resources in private networks:
```yaml
VPC Settings:
  VPC: vpc-12345
  Subnets: subnet-abc, subnet-def
  Security Groups: sg-lambda-access
```

### **Dead Letter Queues**

Handle failed executions:
```yaml
Dead Letter Queue:
  Resource: SQS queue ARN
  Target ARN: arn:aws:sqs:region:account:dlq-queue
```

---

## 📦 **Dependencies and Layers**

### **Installing Dependencies**

**Method 1: Include in deployment package**
```bash
# In your project directory
npm install @aws-sdk/client-dynamodb @hashgraph/sdk axios

# Create deployment package
zip -r function.zip . -x "node_modules/.cache/*" "*.git*"

# Upload via CLI
aws lambda update-function-code \
  --function-name safemate-function \
  --zip-file fileb://function.zip
```

**Method 2: Using Layers**
```bash
# Create layer structure
mkdir -p layer/nodejs
cd layer/nodejs
npm install @aws-sdk/client-dynamodb

# Create layer
cd ..
zip -r layer.zip .

# Create layer in AWS
aws lambda publish-layer-version \
  --layer-name safemate-dependencies \
  --zip-file fileb://layer.zip \
  --compatible-runtimes nodejs18.x
```

### **Using Layers in Function**
```yaml
Layers:
  - arn:aws:lambda:region:account:layer:safemate-dependencies:1
  - arn:aws:lambda:region:account:layer:common-utils:2
```

---

## 🔗 **Event Sources and Triggers**

### **API Gateway Integration**

Lambda receives HTTP events from API Gateway:
```javascript
exports.handler = async (event) => {
    const {
        httpMethod,
        path,
        queryStringParameters,
        headers,
        body,
        requestContext
    } = event;
    
    console.log('HTTP Method:', httpMethod);
    console.log('Path:', path);
    console.log('Query Params:', queryStringParameters);
    
    if (httpMethod === 'GET') {
        return handleGet(queryStringParameters);
    } else if (httpMethod === 'POST') {
        return handlePost(JSON.parse(body || '{}'));
    }
    
    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};
```

### **S3 Event Processing**
```javascript
exports.handler = async (event) => {
    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = record.s3.object.key;
        
        console.log(`Processing ${key} from ${bucket}`);
        
        // Process the S3 object
        await processS3Object(bucket, key);
    }
};
```

### **DynamoDB Streams**
```javascript
exports.handler = async (event) => {
    for (const record of event.Records) {
        const { eventName, dynamodb } = record;
        
        if (eventName === 'INSERT') {
            const newItem = dynamodb.NewImage;
            await handleNewRecord(newItem);
        } else if (eventName === 'MODIFY') {
            const oldItem = dynamodb.OldImage;
            const newItem = dynamodb.NewImage;
            await handleUpdatedRecord(oldItem, newItem);
        }
    }
};
```

### **Scheduled Events (EventBridge)**
```javascript
exports.handler = async (event) => {
    console.log('Scheduled event triggered at:', event.time);
    
    // Run scheduled task
    await runDailyBackup();
    await cleanupOldFiles();
    
    return { status: 'completed' };
};
```

---

## 🛠️ **SafeMate-Specific Examples**

### **Price API Lambda**
```javascript
const axios = require('axios');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient());

exports.handler = async (event) => {
    try {
        console.log('SafeMate Price API Event:', JSON.stringify(event, null, 2));
        
        const { httpMethod, path, queryStringParameters } = event;
        
        // Route based on path
        if (path === '/tokens') {
            return await handleTokens(queryStringParameters);
        } else if (path === '/prices') {
            return await handlePrices(queryStringParameters);
        }
        
        return createResponse(404, { error: 'Endpoint not found' });
        
    } catch (error) {
        console.error('Error:', error);
        return createResponse(500, { error: error.message });
    }
};

async function handleTokens(params) {
    try {
        // Check cache first
        const cached = await getFromCache('tokens');
        if (cached && !isExpired(cached.timestamp)) {
            return createResponse(200, cached.data);
        }
        
        // Fetch from SaucerSwap
        const response = await axios.get('https://api.saucerswap.finance/tokens');
        const tokens = response.data;
        
        // Cache the result
        await saveToCache('tokens', tokens);
        
        return createResponse(200, {
            data: tokens,
            source: 'saucerswap',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error fetching tokens:', error);
        
        // Return cached data if available
        const cached = await getFromCache('tokens');
        if (cached) {
            return createResponse(200, {
                ...cached.data,
                source: 'cache'
            });
        }
        
        throw error;
    }
}

async function getFromCache(key) {
    try {
        const result = await dynamodb.send(new GetCommand({
            TableName: process.env.CACHE_TABLE,
            Key: { id: key }
        }));
        return result.Item;
    } catch (error) {
        console.warn('Cache miss:', key);
        return null;
    }
}

async function saveToCache(key, data) {
    try {
        await dynamodb.send(new PutCommand({
            TableName: process.env.CACHE_TABLE,
            Item: {
                id: key,
                data: data,
                timestamp: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + 300 // 5 minutes
            }
        }));
    } catch (error) {
        console.warn('Failed to cache:', error);
    }
}

function isExpired(timestamp, maxAgeMinutes = 5) {
    const age = Date.now() - new Date(timestamp).getTime();
    return age > maxAgeMinutes * 60 * 1000;
}

function createResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': statusCode === 200 ? 'public, max-age=60' : 'no-cache'
        },
        body: JSON.stringify(body)
    };
}
```

### **NFT Creation Lambda**
```javascript
const { 
    Client, 
    TokenCreateTransaction, 
    TokenMintTransaction,
    TokenType, 
    TokenSupplyType,
    PrivateKey,
    AccountId 
} = require('@hashgraph/sdk');

const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');

exports.handler = async (event) => {
    try {
        const { action } = JSON.parse(event.body || '{}');
        
        switch (action) {
            case 'create_nft_collection':
                return await createNFTCollection();
            case 'mint_nft':
                return await mintNFT(event);
            default:
                return createResponse(400, { error: 'Invalid action' });
        }
        
    } catch (error) {
        console.error('NFT Lambda Error:', error);
        return createResponse(500, { error: error.message });
    }
};

async function createNFTCollection() {
    const credentials = await getHederaCredentials();
    
    const client = Client.forTestnet().setOperator(
        AccountId.fromString(credentials.accountId),
        PrivateKey.fromString(credentials.privateKey)
    );
    
    const transaction = await new TokenCreateTransaction()
        .setTokenName("SafeMate User Guide")
        .setTokenSymbol("SMUG")
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Infinite)
        .setTreasuryAccountId(credentials.accountId)
        .setSupplyKey(PrivateKey.fromString(credentials.privateKey))
        .execute(client);
    
    const receipt = await transaction.getReceipt(client);
    
    return createResponse(200, {
        success: true,
        tokenId: receipt.tokenId.toString(),
        transactionId: transaction.transactionId.toString()
    });
}

async function getHederaCredentials() {
    const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION });
    
    const command = new GetSecretValueCommand({
        SecretId: 'safemate/admin/hedera-credentials'
    });
    
    const response = await secretsManager.send(command);
    return JSON.parse(response.SecretString);
}
```

---

## 📊 **Monitoring and Debugging**

### **CloudWatch Logs**

Every Lambda function automatically logs to CloudWatch:

```javascript
exports.handler = async (event) => {
    // These appear in CloudWatch Logs
    console.log('Info message');
    console.warn('Warning message');  
    console.error('Error message');
    
    // Structured logging
    console.log(JSON.stringify({
        level: 'INFO',
        message: 'Processing request',
        userId: event.userId,
        timestamp: new Date().toISOString()
    }));
};
```

### **X-Ray Tracing**

Enable distributed tracing:

```javascript
const AWSXRay = require('aws-xray-sdk-core');
const AWS = AWSXRay.captureAWS(require('aws-sdk'));

exports.handler = async (event) => {
    const subsegment = AWSXRay.getSegment().addNewSubsegment('custom-operation');
    
    try {
        // Your code here
        subsegment.addAnnotation('operation', 'token-fetch');
        subsegment.addMetadata('requestData', event);
        
        const result = await processRequest(event);
        return result;
        
    } catch (error) {
        subsegment.addError(error);
        throw error;
    } finally {
        subsegment.close();
    }
};
```

### **Custom Metrics**

Send custom metrics to CloudWatch:

```javascript
const { CloudWatchClient, PutMetricDataCommand } = require('@aws-sdk/client-cloudwatch');

const cloudwatch = new CloudWatchClient();

async function recordMetric(metricName, value, unit = 'Count') {
    try {
        await cloudwatch.send(new PutMetricDataCommand({
            Namespace: 'SafeMate/Lambda',
            MetricData: [{
                MetricName: metricName,
                Value: value,
                Unit: unit,
                Timestamp: new Date(),
                Dimensions: [{
                    Name: 'FunctionName',
                    Value: process.env.AWS_LAMBDA_FUNCTION_NAME
                }]
            }]
        }));
    } catch (error) {
        console.warn('Failed to record metric:', error);
    }
}

exports.handler = async (event) => {
    const startTime = Date.now();
    
    try {
        // Your function logic
        const result = await processRequest(event);
        
        // Record success metric
        await recordMetric('SuccessfulRequests', 1);
        
        return result;
        
    } catch (error) {
        // Record error metric
        await recordMetric('ErrorRequests', 1);
        throw error;
    } finally {
        // Record execution time
        const duration = Date.now() - startTime;
        await recordMetric('ExecutionDuration', duration, 'Milliseconds');
    }
};
```

---

## ⚡ **Performance Optimization**

### **Cold Start Optimization**

```javascript
// Initialize outside handler (runs once per container)
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const axios = require('axios');

// Create clients outside handler
const dynamoClient = new DynamoDBClient();
const httpClient = axios.create({
    timeout: 10000,
    headers: { 'User-Agent': 'SafeMate-Lambda/1.0' }
});

// Connection pooling
const https = require('https');
const httpsAgent = new https.Agent({
    keepAlive: true,
    maxSockets: 50
});

httpClient.defaults.httpsAgent = httpsAgent;

exports.handler = async (event) => {
    // Handler code uses pre-initialized clients
    // This avoids cold start penalties
};
```

### **Memory Optimization**

Choose memory based on your workload:

```javascript
// CPU-intensive (large memory for more CPU)
// Memory: 3008 MB for ~2 vCPU

// I/O-intensive (smaller memory sufficient)  
// Memory: 512 MB for basic operations

// Monitor actual usage and adjust
console.log('Memory limit:', process.env.AWS_LAMBDA_FUNCTION_MEMORY_SIZE);
console.log('Memory used:', process.memoryUsage());
```

### **Connection Reuse**

```javascript
// Reuse database connections
let dbConnection = null;

async function getDbConnection() {
    if (!dbConnection) {
        dbConnection = await createConnection();
    }
    return dbConnection;
}

exports.handler = async (event) => {
    const db = await getDbConnection();
    // Use the connection
};
```

---

## 🛡️ **Security Best Practices**

### **IAM Permissions**

Follow principle of least privilege:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem"
            ],
            "Resource": "arn:aws:dynamodb:region:account:table/safemate-*"
        }
    ]
}
```

### **Environment Variables Encryption**

Encrypt sensitive data:

```javascript
// Lambda console: Configuration → Environment variables → Encryption
const { KMSClient, DecryptCommand } = require('@aws-sdk/client-kms');

async function decryptEnvVar(encryptedValue) {
    const kms = new KMSClient();
    const command = new DecryptCommand({
        CiphertextBlob: Buffer.from(encryptedValue, 'base64')
    });
    const result = await kms.send(command);
    return result.Plaintext.toString();
}
```

### **Input Validation**

Always validate inputs:

```javascript
function validateInput(event) {
    const errors = [];
    
    if (!event.body) {
        errors.push('Request body is required');
    }
    
    try {
        const body = JSON.parse(event.body);
        
        if (!body.userId || typeof body.userId !== 'string') {
            errors.push('userId is required and must be a string');
        }
        
        if (body.tokens && !Array.isArray(body.tokens)) {
            errors.push('tokens must be an array');
        }
        
    } catch (e) {
        errors.push('Invalid JSON in request body');
    }
    
    return errors;
}

exports.handler = async (event) => {
    const errors = validateInput(event);
    if (errors.length > 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({ errors })
        };
    }
    
    // Process valid input
};
```

---

## 🧪 **Testing Lambda Functions**

### **Unit Testing with Jest**

```javascript
// tests/handler.test.js
const { handler } = require('../index');

describe('SafeMate Lambda Handler', () => {
    test('should return tokens successfully', async () => {
        const event = {
            httpMethod: 'GET',
            path: '/tokens',
            queryStringParameters: null
        };
        
        const result = await handler(event);
        
        expect(result.statusCode).toBe(200);
        expect(JSON.parse(result.body)).toHaveProperty('data');
    });
    
    test('should handle errors gracefully', async () => {
        const event = {
            httpMethod: 'POST',
            path: '/invalid',
            body: 'invalid json'
        };
        
        const result = await handler(event);
        
        expect(result.statusCode).toBe(400);
        expect(JSON.parse(result.body)).toHaveProperty('error');
    });
});
```

### **Integration Testing**

```javascript
// tests/integration.test.js
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda({ region: 'ap-southeast-2' });

describe('Integration Tests', () => {
    test('should invoke lambda successfully', async () => {
        const params = {
            FunctionName: 'safemate-price-api',
            Payload: JSON.stringify({
                httpMethod: 'GET',
                path: '/tokens'
            })
        };
        
        const result = await lambda.invoke(params).promise();
        const response = JSON.parse(result.Payload);
        
        expect(response.statusCode).toBe(200);
    });
});
```

### **Local Testing with SAM**

```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  SafeMateFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./
      Handler: index.handler
      Runtime: nodejs18.x
      Events:
        Api:
          Type: Api
          Properties:
            Path: /{proxy+}
            Method: ANY
```

```bash
# Test locally
sam local start-api
curl http://localhost:3000/tokens
```

---

## 💰 **Cost Optimization**

### **Pricing Model**

Lambda pricing is based on:
- **Requests**: $0.20 per 1M requests
- **Duration**: GB-second of execution time
- **Memory**: More memory = higher cost per second

### **Cost Optimization Tips**

1. **Right-size Memory**
   ```javascript
   // Monitor and adjust based on actual usage
   console.log('Max memory used:', context.getRemainingMemoryInMB());
   ```

2. **Minimize Cold Starts**
   ```javascript
   // Keep connections alive
   // Initialize outside handler
   // Use provisioned concurrency for critical functions
   ```

3. **Use Appropriate Timeout**
   ```javascript
   // Don't use max timeout if not needed
   // Monitor actual execution times
   const remainingTime = context.getRemainingTimeInMillis();
   ```

---

## 📋 **Lambda Best Practices Checklist**

### **✅ Code Quality**
- [ ] Use async/await instead of callbacks
- [ ] Handle errors properly with try/catch
- [ ] Log meaningful information
- [ ] Validate all inputs
- [ ] Return consistent response format

### **✅ Performance**
- [ ] Initialize connections outside handler
- [ ] Use connection pooling
- [ ] Choose appropriate memory size
- [ ] Implement caching where beneficial
- [ ] Monitor cold start impact

### **✅ Security**
- [ ] Follow least privilege IAM permissions
- [ ] Encrypt sensitive environment variables
- [ ] Use VPC when accessing private resources
- [ ] Validate and sanitize inputs
- [ ] Don't log sensitive data

### **✅ Monitoring**
- [ ] Use structured logging
- [ ] Set up CloudWatch alarms
- [ ] Implement custom metrics
- [ ] Use X-Ray for tracing
- [ ] Monitor error rates and duration

This comprehensive guide covers everything you need to build robust Lambda functions for SafeMate!