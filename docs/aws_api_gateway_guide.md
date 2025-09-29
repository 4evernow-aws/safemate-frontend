# AWS API Gateway Complete User Guide

## 🎯 **What is API Gateway?**

AWS API Gateway is a fully managed service that makes it easy to create, publish, maintain, monitor, and secure APIs at any scale. It acts as a "front door" for applications to access data, business logic, or functionality from backend services.

---

## 🏗️ **Core Concepts**

### **API Types**
- **REST API**: Traditional request-response model
- **HTTP API**: Lighter, faster, cheaper than REST
- **WebSocket API**: Real-time bidirectional communication

### **Key Components**
- **Resources**: URL paths (e.g., `/users`, `/tokens`)
- **Methods**: HTTP methods (GET, POST, PUT, DELETE)
- **Stages**: Environment deployments (dev, test, prod)
- **Integrations**: Backend connections (Lambda, HTTP, AWS services)

---

## 🚀 **Getting Started**

### **Step 1: Create Your First API**

1. **Open AWS Console** → Search "API Gateway"
2. **Click "Create API"**
3. **Choose API Type:**
   - REST API (recommended for most use cases)
   - HTTP API (for simple, high-performance APIs)
4. **Configure Basic Settings:**
   ```
   API Name: SafeMate Price API
   Description: Hedera token pricing API
   Endpoint Type: Regional
   ```

### **Step 2: Create Resources**

**Resources are URL paths in your API:**

```
Root (/)
├── tokens
├── pools  
├── prices
└── ticker
```

**To create a resource:**
1. Select parent resource (usually root)
2. Click "Create Resource"
3. Enter resource name (e.g., "tokens")
4. Resource path will be auto-generated

### **Step 3: Create Methods**

**Methods define what HTTP operations are allowed:**

1. **Select a resource** (e.g., `/tokens`)
2. **Click "Create Method"**
3. **Choose HTTP method** (GET, POST, etc.)
4. **Configure integration:**
   - Integration Type: Lambda Function
   - Lambda Function: your-function-name
   - Use Lambda Proxy integration: ✅ Enabled

### **Step 4: Deploy API**

1. **Click "Deploy API"**
2. **Select deployment stage:**
   - Create new stage: `v1`
   - Stage description: Production v1
3. **Click "Deploy"**
4. **Note the Invoke URL:** `https://abc123.execute-api.region.amazonaws.com/v1`

---

## 🔧 **Advanced Configuration**

### **Request/Response Transformation**

Transform requests before they reach your backend:

```json
{
  "application/json": {
    "user_id": "$input.params('userId')",
    "body": $input.json('$'),
    "headers": {
      #foreach($param in $input.params().header.keySet())
      "$param": "$util.escapeJavaScript($input.params().header.get($param))"
      #end
    }
  }
}
```

### **Request Validation**

Validate incoming requests before processing:

```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "type": "object",
  "properties": {
    "userId": {
      "type": "string",
      "pattern": "^[a-zA-Z0-9-]+$"
    },
    "tokens": {
      "type": "array",
      "items": {
        "type": "string"
      }
    }
  },
  "required": ["userId"]
}
```

### **Authorization**

**API Key Authorization:**
```yaml
x-api-key: your-api-key-here
```

**Lambda Authorizer:**
```javascript
exports.handler = async (event) => {
  const token = event.authorizationToken;
  
  // Validate token logic here
  if (isValidToken(token)) {
    return {
      principalId: 'user123',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }]
      }
    };
  }
  
  throw new Error('Unauthorized');
};
```

---

## 📊 **Monitoring and Logging**

### **CloudWatch Integration**

API Gateway automatically logs to CloudWatch:

```bash
# View API Gateway logs
aws logs describe-log-groups --log-group-name-prefix "API-Gateway-Execution-Logs"

# Get recent logs
aws logs tail "API-Gateway-Execution-Logs_your-api-id/v1" --follow
```

### **Key Metrics to Monitor**
- **4XXError**: Client-side errors
- **5XXError**: Server-side errors  
- **Count**: Total number of API calls
- **Latency**: Response time
- **IntegrationLatency**: Backend response time

### **Custom Logging**

Enable detailed logging in stage settings:
```
Log Level: INFO
Log full requests/responses: ✅
Data Trace: ✅
```

---

## 💰 **Cost Optimization**

### **Pricing Model**
- **REST API**: $3.50 per million API calls
- **HTTP API**: $1.00 per million API calls
- **Data Transfer**: $0.09 per GB

### **Cost Reduction Tips**
1. **Use HTTP APIs** for simple use cases
2. **Enable caching** for frequently requested data
3. **Implement request throttling** to prevent abuse
4. **Use regional endpoints** instead of edge-optimized

### **Caching Configuration**
```yaml
Cache Settings:
  Cache cluster enabled: Yes
  Cache cluster size: 0.5 GB
  TTL: 300 seconds (5 minutes)
  Cache key parameters:
    - method.request.querystring.tokens
    - method.request.header.Authorization
```

---

## 🛡️ **Security Best Practices**

### **1. Authentication & Authorization**
```javascript
// Always validate incoming requests
if (!event.requestContext.authorizer.principalId) {
  return {
    statusCode: 401,
    body: JSON.stringify({ error: 'Unauthorized' })
  };
}
```

### **2. Input Validation**
```javascript
// Validate all inputs
const { userId, tokens } = JSON.parse(event.body);
if (!userId || typeof userId !== 'string') {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: 'Invalid userId' })
  };
}
```

### **3. Rate Limiting**
Configure throttling in stage settings:
```
Throttle Settings:
  Rate: 1000 requests per second
  Burst: 2000 requests
```

### **4. CORS Configuration** (See dedicated CORS guide)

---

## 🔄 **Integration Patterns**

### **Lambda Proxy Integration**
```javascript
exports.handler = async (event) => {
  // Event contains all request data
  const { httpMethod, path, queryStringParameters, body, headers } = event;
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ success: true, data: result })
  };
};
```

### **HTTP Integration**
Direct integration with HTTP backends:
```
Integration Type: HTTP
HTTP method: GET
Endpoint URL: https://api.saucerswap.finance/tokens
```

### **AWS Service Integration**
Direct integration with AWS services:
```
Integration Type: AWS Service
AWS Service: DynamoDB
HTTP method: POST
Action: Query
```

---

## 🧪 **Testing Your API**

### **Built-in Test Console**
1. Go to your method in API Gateway console
2. Click "TEST"
3. Add query parameters, headers, body
4. Click "Test" to execute

### **Using curl**
```bash
# Test GET endpoint
curl -X GET "https://your-api-id.execute-api.region.amazonaws.com/v1/tokens" \
  -H "Content-Type: application/json"

# Test POST endpoint
curl -X POST "https://your-api-id.execute-api.region.amazonaws.com/v1/prices" \
  -H "Content-Type: application/json" \
  -d '{"tokens": ["0.0.456858", "0.0.123456"]}'
```

### **Load Testing**
```bash
# Using Apache Bench
ab -n 1000 -c 10 "https://your-api-id.execute-api.region.amazonaws.com/v1/tokens"

# Using curl with parallel requests
seq 1 100 | xargs -I {} -P 10 curl -s "https://your-api-id.execute-api.region.amazonaws.com/v1/tokens" > /dev/null
```

---

## 📋 **Common Patterns & Examples**

### **RESTful API Structure**
```
GET    /tokens           - List all tokens
GET    /tokens/{id}      - Get specific token
POST   /tokens           - Create token (admin only)
PUT    /tokens/{id}      - Update token (admin only)
DELETE /tokens/{id}      - Delete token (admin only)

GET    /prices           - Get all prices
GET    /prices/{token}   - Get price for specific token
```

### **Error Handling**
```javascript
try {
  // API logic here
  return {
    statusCode: 200,
    body: JSON.stringify({ success: true, data: result })
  };
} catch (error) {
  console.error('API Error:', error);
  
  return {
    statusCode: error.statusCode || 500,
    body: JSON.stringify({
      success: false,
      error: error.message || 'Internal Server Error',
      timestamp: new Date().toISOString()
    })
  };
}
```

### **Response Formatting**
```javascript
// Consistent response format
const createResponse = (statusCode, data, error = null) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': statusCode === 200 ? 'public, max-age=60' : 'no-cache'
  },
  body: JSON.stringify({
    success: statusCode < 400,
    data: statusCode < 400 ? data : null,
    error: error,
    timestamp: new Date().toISOString()
  })
});
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

**1. CORS Errors**
```javascript
// Ensure CORS headers in response
headers: {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
}
```

**2. Integration Timeout**
```
Error: Integration timeout
Solution: Increase timeout in integration settings (max 29 seconds)
```

**3. Lambda Proxy Integration Errors**
```javascript
// Must return proper format
return {
  statusCode: 200,  // Required
  body: JSON.stringify(data)  // Must be string
};
```

**4. Too Many Requests**
```
Error: 429 Too Many Requests
Solution: Check throttling settings or implement backoff in client
```

---

## 📈 **Performance Optimization**

### **1. Enable Caching**
- Cache frequently accessed data
- Set appropriate TTL based on data freshness needs
- Use cache key parameters to cache different responses

### **2. Optimize Lambda Cold Starts**
```javascript
// Initialize outside handler for reuse
const client = new SomeClient();

exports.handler = async (event) => {
  // Handler code here
};
```

### **3. Use HTTP APIs for Simple Cases**
- 70% cost reduction compared to REST APIs
- Lower latency
- Automatic request/response validation

### **4. Implement Compression**
```javascript
headers: {
  'Content-Encoding': 'gzip'
}
```

---

## 🔗 **Integration with SafeMate**

### **SafeMate Price API Example**
```javascript
// API Gateway → Lambda → SaucerSwap → Response
exports.handler = async (event) => {
  const { path, queryStringParameters } = event;
  
  if (path === '/tokens') {
    return await handleTokensRequest(queryStringParameters);
  } else if (path === '/prices') {
    return await handlePricesRequest(queryStringParameters);
  }
  
  return createResponse(404, null, 'Endpoint not found');
};
```

This guide covers everything you need to know about AWS API Gateway for building robust, scalable APIs for SafeMate!