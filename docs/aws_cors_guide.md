# AWS CORS Complete User Guide

## 🎯 **What is CORS?**

**Cross-Origin Resource Sharing (CORS)** is a security feature implemented by web browsers that blocks requests from one domain (origin) to another domain unless the server explicitly allows it. This prevents malicious websites from making unauthorized requests to your APIs.

---

## 🔍 **Understanding CORS**

### **Same-Origin Policy**
Browsers only allow requests to the same origin (protocol + domain + port):

```
✅ ALLOWED (Same Origin):
https://safemate.com → https://safemate.com/api

❌ BLOCKED (Cross-Origin):
https://safemate.com → https://api.other-domain.com
http://localhost:3000 → https://api.safemate.com
```

### **When CORS is Needed**
- Web app at `https://safemate.com` calls API at `https://api.safemate.com`
- Development server `http://localhost:3000` calls production API
- React app calling AWS API Gateway from different domain

---

## 🛠️ **CORS in AWS API Gateway**

### **Method 1: Enable CORS in Console**

1. **Select your resource** (e.g., `/tokens`)
2. **Click "Actions" → "Enable CORS"**
3. **Configure CORS settings:**
   ```
   Access-Control-Allow-Origin: *
   Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
   Access-Control-Allow-Methods: GET,POST,OPTIONS
   ```
4. **Click "Enable CORS and replace existing CORS headers"**
5. **Deploy API** to apply changes

### **Method 2: Manual OPTIONS Method**

**Create OPTIONS method manually:**

1. **Select resource** → **Create Method** → **OPTIONS**
2. **Integration type**: Mock
3. **Add Integration Response:**
   ```
   Status: 200
   Headers:
     Access-Control-Allow-Origin: '*'
     Access-Control-Allow-Headers: 'Content-Type,Authorization'
     Access-Control-Allow-Methods: 'GET,POST,OPTIONS'
   ```

---

## 🏗️ **CORS in Lambda Functions**

### **Always Include CORS Headers**

```javascript
exports.handler = async (event) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: ''
    };
  }
  
  try {
    // Your API logic here
    const result = await processRequest(event);
    
    return {
      statusCode: 200,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        success: true,
        data: result
      })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: getCorsHeaders(),
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

function getCorsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Max-Age': '86400' // 24 hours
  };
}
```

### **Environment-Specific Origins**

```javascript
function getCorsHeaders(event) {
  // Get origin from request
  const origin = event.headers.origin || event.headers.Origin;
  
  // Define allowed origins
  const allowedOrigins = [
    'https://safemate.com',
    'https://www.safemate.com',
    'https://app.safemate.com',
    'http://localhost:3000',  // Development
    'http://localhost:5173',  // Vite dev server
    'http://localhost:5174'   // Alternative Vite port
  ];
  
  // Check if origin is allowed
  const allowOrigin = allowedOrigins.includes(origin) ? origin : 'null';
  
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}
```

---

## 🔧 **Advanced CORS Configuration**

### **Preflight Requests**

Complex requests trigger a preflight OPTIONS request:

```javascript
// Preflight triggers when:
// - HTTP method is not GET, HEAD, or POST
// - Custom headers are sent
// - Content-Type is not application/x-www-form-urlencoded, multipart/form-data, or text/plain

// Handle preflight
if (event.httpMethod === 'OPTIONS') {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Custom-Header',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Max-Age': '86400'
    },
    body: ''
  };
}
```

### **Credentials and Cookies**

For authenticated requests with cookies:

```javascript
headers: {
  'Access-Control-Allow-Origin': 'https://safemate.com', // Cannot be * with credentials
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Cookie'
}
```

### **Custom Headers**

Allow custom headers in requests:

```javascript
headers: {
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-User-ID,X-Session-Token,X-API-Version'
}
```

---

## 🎯 **SafeMate-Specific CORS Setup**

### **Development Environment**

```javascript
// For local development
function getDevCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'http://localhost:5174',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}
```

### **Production Environment**

```javascript
// For production
function getProdCorsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'https://safemate.com',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };
}
```

### **Multi-Environment Handler**

```javascript
function getCorsHeaders(event) {
  const origin = event.headers.origin || event.headers.Origin;
  const stage = event.requestContext.stage;
  
  let allowedOrigin = 'null';
  
  if (stage === 'dev' || stage === 'test') {
    // Development/testing origins
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'https://dev.safemate.com'
    ];
    allowedOrigin = devOrigins.includes(origin) ? origin : 'null';
  } else {
    // Production origins
    const prodOrigins = [
      'https://safemate.com',
      'https://www.safemate.com',
      'https://app.safemate.com'
    ];
    allowedOrigin = prodOrigins.includes(origin) ? origin : 'null';
  }
  
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Max-Age': '86400'
  };
}
```

---

## 🚨 **Common CORS Errors & Solutions**

### **Error 1: "CORS policy: No 'Access-Control-Allow-Origin' header"**

**Cause**: Missing CORS headers in response
**Solution**:
```javascript
// Always include in every response
headers: {
  'Access-Control-Allow-Origin': '*'
}
```

### **Error 2: "CORS policy: Request header field authorization is not allowed"**

**Cause**: Authorization header not allowed in preflight
**Solution**:
```javascript
headers: {
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
}
```

### **Error 3: "CORS policy: Method POST is not allowed"**

**Cause**: POST method not allowed in preflight
**Solution**:
```javascript
headers: {
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
}
```

### **Error 4: "CORS policy: The request client is not a secure context"**

**Cause**: Making HTTPS request from HTTP page
**Solution**: Use HTTPS for your frontend or allow HTTP in development

---

## 🧪 **Testing CORS**

### **Browser Developer Tools**

1. **Open browser dev tools** (F12)
2. **Go to Network tab**
3. **Make request from your app**
4. **Check request/response headers:**
   ```
   Request Headers:
     Origin: https://safemate.com
   
   Response Headers:
     Access-Control-Allow-Origin: https://safemate.com
   ```

### **Using curl to Test Preflight**

```bash
# Test preflight OPTIONS request
curl -X OPTIONS \
  -H "Origin: https://safemate.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  "https://your-api-gateway-url.com/tokens" \
  -v
```

### **JavaScript Test**

```javascript
// Test CORS from browser console
fetch('https://your-api-url.com/tokens', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token'
  }
})
.then(response => response.json())
.then(data => console.log('CORS working:', data))
.catch(error => console.error('CORS error:', error));
```

---

## 🔒 **Security Considerations**

### **Avoid Wildcard in Production**

❌ **Don't do this in production:**
```javascript
'Access-Control-Allow-Origin': '*'
```

✅ **Do this instead:**
```javascript
'Access-Control-Allow-Origin': 'https://safemate.com'
```

### **Validate Origins**

```javascript
function isValidOrigin(origin) {
  const allowedOrigins = [
    'https://safemate.com',
    'https://www.safemate.com'
  ];
  
  return allowedOrigins.includes(origin);
}

function getCorsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': isValidOrigin(origin) ? origin : 'null'
  };
}
```

### **Limit Methods and Headers**

Only allow what you actually need:
```javascript
headers: {
  'Access-Control-Allow-Methods': 'GET,POST',  // Only needed methods
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'  // Only needed headers
}
```

---

## 📋 **CORS Checklist for SafeMate**

### **✅ Development Setup**
- [ ] Allow `http://localhost:5174` origin
- [ ] Include all necessary headers (Content-Type, Authorization)
- [ ] Handle OPTIONS preflight requests
- [ ] Test with your React development server

### **✅ Production Setup**
- [ ] Set specific allowed origins (not wildcard)
- [ ] Validate origins dynamically
- [ ] Include credentials support if needed
- [ ] Test from production frontend

### **✅ Lambda Function Requirements**
- [ ] CORS headers in every response (200, 400, 500, etc.)
- [ ] Handle OPTIONS method explicitly
- [ ] Use consistent header format
- [ ] Include Max-Age for preflight caching

### **✅ API Gateway Configuration**
- [ ] Enable CORS on all resources
- [ ] Deploy API after CORS changes
- [ ] Test all HTTP methods
- [ ] Verify preflight responses

---

## 🔗 **Integration with SafeMate**

### **Complete SafeMate CORS Handler**

```javascript
// SafeMate CORS utilities
class SafeMateCorS {
  static getAllowedOrigins() {
    return {
      development: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174'
      ],
      production: [
        'https://safemate.com',
        'https://www.safemate.com',
        'https://app.safemate.com'
      ]
    };
  }
  
  static getCorsHeaders(event) {
    const origin = event.headers.origin || event.headers.Origin;
    const stage = event.requestContext?.stage || 'production';
    
    const allowedOrigins = stage === 'dev' 
      ? [...this.getAllowedOrigins().development, ...this.getAllowedOrigins().production]
      : this.getAllowedOrigins().production;
    
    const allowOrigin = allowedOrigins.includes(origin) ? origin : 'null';
    
    return {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Allow-Credentials': 'true'
    };
  }
  
  static createResponse(statusCode, data, error = null, event = null) {
    return {
      statusCode,
      headers: event ? this.getCorsHeaders(event) : {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: statusCode < 400,
        data: statusCode < 400 ? data : null,
        error: error,
        timestamp: new Date().toISOString()
      })
    };
  }
}

// Usage in Lambda
exports.handler = async (event) => {
  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return SafeMateCorS.createResponse(200, null, null, event);
  }
  
  try {
    // Your API logic
    const result = await yourApiLogic(event);
    return SafeMateCorS.createResponse(200, result, null, event);
  } catch (error) {
    return SafeMateCorS.createResponse(500, null, error.message, event);
  }
};
```

This CORS guide will ensure your SafeMate API works seamlessly with your React frontend!