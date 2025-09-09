# SafeMate Environment Management Guide

## 🎯 **Environment Separation Strategy**

This guide explains how to properly manage different environments (dev, preprod, production) for the SafeMate application.

## 📁 **Environment File Structure**

```
.env                    # Base configuration (fallback)
.env.development        # Development environment (local dev)
.env.preprod           # Pre-production environment (staging)
.env.production        # Production environment (live)
.env.local             # Local overrides (gitignored)
```

## 🚀 **Available Commands**

### **Development (Local)**
```bash
npm run dev              # Start dev server with dev config
npm run start            # Same as dev
npm run build:dev        # Build for dev environment
```

### **Pre-Production (Staging)**
```bash
npm run dev:preprod      # Start dev server with preprod config
npm run build:preprod    # Build for preprod environment
```

### **Production (Live)**
```bash
npm run dev:production   # Start dev server with production config
npm run build            # Build for production (default)
```

## 🔧 **How It Works**

### **Vite Environment Loading Order**
1. `.env.local` (highest priority, gitignored)
2. `.env.[mode]` (mode-specific file)
3. `.env` (base configuration)

### **Mode Detection**
- `npm run dev` → `--mode development` → loads `.env.development`
- `npm run dev:preprod` → `--mode preprod` → loads `.env.preprod`
- `npm run dev:production` → `--mode production` → loads `.env.production`

## 📋 **Environment Configurations**

### **Development Environment**
- **User Pool**: `dev-safemate-user-pool-v2`
- **User Pool ID**: `ap-southeast-2_2fMWFFs8i`
- **API URLs**: `*.execute-api.ap-southeast-2.amazonaws.com/dev`
- **App URL**: `http://localhost:5173`
- **Debug Mode**: `true`

### **Pre-Production Environment**
- **User Pool**: `preprod-safemate-user-pool-v2`
- **User Pool ID**: `ap-southeast-2_pMo5BXFiM`
- **API URLs**: `*.execute-api.ap-southeast-2.amazonaws.com/preprod`
- **App URL**: `https://d19a5c2wn4mtdt.cloudfront.net`
- **Debug Mode**: `false`

### **Production Environment**
- **User Pool**: `prod-safemate-user-pool-v2`
- **User Pool ID**: `ap-southeast-2_XXXXXXX`
- **API URLs**: `*.execute-api.ap-southeast-2.amazonaws.com/prod`
- **App URL**: `https://safemate.com`
- **Debug Mode**: `false`

## 🛠️ **Switching Environments**

### **For Local Development**
```bash
# Use development environment (default)
npm run dev

# Use preprod environment for testing
npm run dev:preprod

# Use production environment for testing
npm run dev:production
```

### **For Building**
```bash
# Build for development
npm run build:dev

# Build for preprod
npm run build:preprod

# Build for production
npm run build
```

## 🔒 **Security Considerations**

### **Environment Variables**
- All sensitive values use `VITE_` prefix for client-side access
- Never commit `.env.local` (it's gitignored)
- Use different User Pools for each environment
- Use different API Gateway stages for each environment

### **CORS Configuration**
- **Dev**: Allows `http://localhost:5173`
- **Preprod**: Allows `https://d19a5c2wn4mtdt.cloudfront.net`
- **Production**: Allows `https://safemate.com`

## 🚨 **Troubleshooting**

### **Wrong Environment Loading**
If the wrong environment is being used:

1. **Check current mode**:
   ```bash
   echo $NODE_ENV
   ```

2. **Clear Vite cache**:
   ```bash
   rm -rf node_modules/.vite
   ```

3. **Restart development server**:
   ```bash
   npm run dev
   ```

### **Environment File Priority Issues**
If `.env.local` is overriding your environment:

1. **Rename or remove `.env.local`**:
   ```bash
   mv .env.local .env.local.backup
   ```

2. **Use explicit mode**:
   ```bash
   npm run dev:development
   ```

## 📝 **Best Practices**

1. **Always use explicit modes** when running commands
2. **Never commit `.env.local`** to version control
3. **Test all environments** before deploying
4. **Use different User Pools** for each environment
5. **Document environment-specific configurations**
6. **Use environment-specific API Gateway stages**

## 🔄 **Migration from Old System**

If you were previously using `.env.local` for preprod:

1. **Move the old file**:
   ```bash
   mv .env.local .env.local.preprod.backup
   ```

2. **Use the new system**:
   ```bash
   npm run dev:preprod
   ```

3. **Verify configuration**:
   Check that the correct environment variables are loaded
