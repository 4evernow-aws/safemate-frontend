# SafeMate Environment Setup Guide

## 🎯 **IMPORTANT: How to Use Environment Files**

### ❌ **WRONG WAY (Don't do this):**
- Copying `.env.dev` to `.env.local`
- Manually managing `.env.local` file
- Overriding Vite's mode system

### ✅ **CORRECT WAY (Do this):**
- Use Vite's mode system with dedicated environment files
- Run the appropriate npm script for each environment
- Let Vite handle the environment file loading automatically

## 📁 **Environment File Structure**

```
apps/web/safemate/
├── .env                    # Base environment (fallback)
├── .env.dev               # Development environment
├── .env.preprod           # Pre-production environment  
├── .env.production        # Production environment
├── .env.local             # Local overrides (gitignored)
└── .env.example           # Template file
```

## 🚀 **Available Commands**

### Development Environment
```bash
npm run dev
# Uses: .env.dev (via --mode development)
# URL: http://localhost:5173/
```

### Pre-Production Environment
```bash
npm run dev:preprod
# Uses: .env.preprod (via --mode preprod)
# URL: http://localhost:5173/
```

### Production Environment
```bash
npm run dev:production
# Uses: .env.production (via --mode production)
# URL: http://localhost:5173/
```

## 🔧 **Vite Mode System**

Vite automatically loads environment files based on the `--mode` flag:

1. **Mode-specific file**: `.env.[mode]` (e.g., `.env.dev`)
2. **Base file**: `.env` (fallback)
3. **Local overrides**: `.env.local` (gitignored, highest priority)

## 📋 **Environment Configurations**

### Development (`.env.dev`)
- **Cognito Pool**: `ap-southeast-2_2fMWFFs8i`
- **API Stage**: `/dev`
- **Network**: Testnet
- **Purpose**: Local development and testing

### Pre-Production (`.env.preprod`)
- **Cognito Pool**: `ap-southeast-2_pMo5BXFiM`
- **API Stage**: `/preprod`
- **Network**: Testnet
- **Purpose**: Staging and pre-production testing

### Production (`.env.production`)
- **Cognito Pool**: Production pool ID
- **API Stage**: `/prod`
- **Network**: Mainnet
- **Purpose**: Live production environment

## 🚨 **Common Mistakes to Avoid**

1. **Don't copy `.env.dev` to `.env.local`**
   - This bypasses Vite's mode system
   - Makes environment switching harder
   - Can cause confusion

2. **Don't manually edit `.env.local` for environment switching**
   - Use the appropriate npm script instead
   - Keep `.env.local` for local-only overrides

3. **Don't run `npm run dev` from the wrong directory**
   - Always run from `apps/web/safemate/`
   - The root directory doesn't have a `dev` script

## 🔍 **Troubleshooting**

### "Missing script: dev" Error
```bash
# ❌ Wrong directory
cd D:\cursor_projects\safemate_v2
npm run dev  # Error: Missing script

# ✅ Correct directory
cd D:\cursor_projects\safemate_v2\apps\web\safemate
npm run dev  # Success!
```

### Environment Variables Not Loading
1. Check you're using the correct npm script
2. Verify the `.env.[mode]` file exists
3. Restart the dev server after environment changes

### Port 5173 Already in Use
```bash
# Kill existing Node processes
taskkill /F /IM node.exe

# Clear Vite cache
Remove-Item -Recurse -Force node_modules/.vite -ErrorAction SilentlyContinue

# Restart server
npm run dev
```

## 📝 **Best Practices**

1. **Always use npm scripts** for environment switching
2. **Keep `.env.local` for local-only settings** (API keys, debug flags)
3. **Document environment changes** in this file
4. **Test all environments** before deploying
5. **Use descriptive commit messages** when changing environment files

## 🔄 **Switching Environments**

To switch from dev to preprod:
```bash
# Stop current server (Ctrl+C)
# Then run:
npm run dev:preprod
```

To switch from preprod to dev:
```bash
# Stop current server (Ctrl+C)
# Then run:
npm run dev
```

---

**Last Updated**: 2025-08-29
**Maintainer**: Development Team
