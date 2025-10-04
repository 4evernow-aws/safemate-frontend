# How to Get Your JWT Token for Testing

## Method 1: From Browser Developer Tools (Recommended)

1. **Open your SafeMate application** in the browser
2. **Open Developer Tools** (Press F12 or right-click → Inspect)
3. **Go to the Network tab**
4. **Create a folder** in the frontend (this will make an API call)
5. **Look for the API request** to `/folders` in the Network tab
6. **Click on the request** to see details
7. **Go to the Headers tab**
8. **Find the Authorization header** - it will look like:
   ```
   Authorization: Bearer eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbT...
   ```
9. **Copy the token** (everything after "Bearer ")

## Method 2: From Browser Console

1. **Open your SafeMate application** in the browser
2. **Open Developer Tools** (Press F12)
3. **Go to the Console tab**
4. **Run this JavaScript code**:
   ```javascript
   // Get the JWT token from localStorage
   const token = localStorage.getItem('cognito-id-token') || 
                 localStorage.getItem('idToken') || 
                 localStorage.getItem('jwt-token');
   console.log('JWT Token:', token);
   ```
5. **Copy the token** from the console output

## Method 3: From Application Storage

1. **Open Developer Tools** (Press F12)
2. **Go to the Application tab** (or Storage tab in Firefox)
3. **Expand Local Storage** in the left sidebar
4. **Click on your domain** (e.g., `https://your-app.com`)
5. **Look for keys like**:
   - `cognito-id-token`
   - `idToken`
   - `jwt-token`
   - `auth-token`
6. **Copy the value** of the token

## Using the Token in Tests

Once you have the token, run the test script:

```powershell
.\test-folder-creation-simple.ps1 -JwtToken "YOUR_ACTUAL_JWT_TOKEN_HERE"
```

## Example Token Format

A JWT token typically looks like this:
```
eyJraWQiOiJSSjlwaStibXlqVk81SjJsSEM5YnFPTlBNOGszbT...very_long_string...UuHhtVZIxCwGcGBsNYDZpVKNX3z5pSbgF6xwPeZcSVREBNk9Q
```

## Security Note

- JWT tokens are sensitive and should not be shared
- They expire after a certain time (usually 1 hour)
- If the token expires, you'll need to get a new one by logging in again

## Troubleshooting

If you get a 401 Unauthorized error:
1. Make sure you copied the entire token (no spaces or extra characters)
2. Check if the token has expired (try logging out and back in)
3. Verify you're using the correct API endpoint
4. Make sure the token starts with "eyJ" (JWT tokens always start with this)
