# 📁 SafeMate Directory Structure Alignment

## 🎯 **Current Issue**
The current directory structure doesn't align with the GitHub repository organization. We need to reorganize the directories to match the proper project structure.

## 📊 **Current Directory Structure (INCORRECT)**

```
D:\
├── safemate-frontend\          # ✅ CORRECT - Frontend React app
├── safemate-backend\           # ❌ INCORRECT - Should be services
├── safemate-infrastructure\    # ❌ INCORRECT - Should be terraform
├── safemate-docs\             # ✅ CORRECT - Documentation
├── safemate-shared\           # ✅ CORRECT - Shared packages
└── cursor_projects\safemate_v2\ # ❌ OLD - Should be removed
```

## 🎯 **Target GitHub Structure (CORRECT)**

Based on the Git Workflow Guide and Project Documentation, the structure should be:

```
safemate_v2/                    # Main repository root
├── apps/
│   └── web/
│       └── safemate/          # Frontend React application
├── services/                   # Backend Lambda functions
│   ├── user-onboarding/
│   ├── wallet-manager/
│   ├── group-manager/
│   ├── hedera-service/
│   └── token-vault/
├── terraform/                  # Infrastructure as Code
│   ├── lambda.tf
│   ├── cognito.tf
│   ├── dynamodb.tf
│   └── variables.tf
├── docs/                       # Documentation
│   ├── README.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── API_DOCUMENTATION.md
├── shared/                     # Shared packages
│   ├── packages/
│   │   ├── constants/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── utils/
│   └── lambda-layers/
└── README.md                   # Main project README
```

## 🔄 **Required Directory Reorganization**

### **Step 1: Create Proper Repository Structure**
```bash
# Create main repository directory
mkdir D:\safemate_v2
cd D:\safemate_v2

# Create proper subdirectories
mkdir apps\web\safemate
mkdir services
mkdir terraform
mkdir docs
mkdir shared
```

### **Step 2: Move Frontend to Correct Location**
```bash
# Move frontend to proper location
Move-Item "D:\safemate-frontend\*" "D:\safemate_v2\apps\web\safemate\"
```

### **Step 3: Move Backend Services to Correct Location**
```bash
# Move backend services to proper location
Move-Item "D:\safemate-backend\*" "D:\safemate_v2\services\"
```

### **Step 4: Move Infrastructure to Correct Location**
```bash
# Move infrastructure to proper location
Move-Item "D:\safemate-infrastructure\*" "D:\safemate_v2\terraform\"
```

### **Step 5: Move Documentation to Correct Location**
```bash
# Move documentation to proper location
Move-Item "D:\safemate-docs\*" "D:\safemate_v2\docs\"
```

### **Step 6: Move Shared Packages to Correct Location**
```bash
# Move shared packages to proper location
Move-Item "D:\safemate-shared\*" "D:\safemate_v2\shared\"
```

### **Step 7: Clean Up Old Directories**
```bash
# Remove old directories after successful move
Remove-Item "D:\safemate-frontend" -Recurse -Force
Remove-Item "D:\safemate-backend" -Recurse -Force
Remove-Item "D:\safemate-infrastructure" -Recurse -Force
Remove-Item "D:\safemate-docs" -Recurse -Force
Remove-Item "D:\safemate-shared" -Recurse -Force
Remove-Item "D:\cursor_projects\safemate_v2" -Recurse -Force
```

## 🌳 **GitHub Branch Structure**

### **Main Branches**
- **`main`** - Production branch (always deployable)
- **`develop`** - Integration branch (optional, for complex projects)

### **Team Development Branches**
- **`team/wallet-widgets`** - Wallet functionality development
- **`team/analytics-widgets`** - Analytics and reporting features
- **`team/files-widgets`** - File management features
- **`team/groups-widgets`** - Group collaboration features
- **`team/nft-widgets`** - NFT management features
- **`team/shared-components`** - Shared UI components

### **Feature Branches**
- **`feature/[feature-name]`** - Individual features
- **`bugfix/[issue-name]`** - Bug fixes
- **`hotfix/[issue-name]`** - Urgent production fixes

## 📋 **Directory Mapping**

| Current Location | Target Location | Purpose |
|------------------|-----------------|---------|
| `D:\safemate-frontend\` | `D:\safemate_v2\apps\web\safemate\` | Frontend React application |
| `D:\safemate-backend\` | `D:\safemate_v2\services\` | Backend Lambda functions |
| `D:\safemate-infrastructure\` | `D:\safemate_v2\terraform\` | Infrastructure as Code |
| `D:\safemate-docs\` | `D:\safemate_v2\docs\` | Project documentation |
| `D:\safemate-shared\` | `D:\safemate_v2\shared\` | Shared packages and utilities |
| `D:\cursor_projects\safemate_v2\` | ❌ **REMOVE** | Old development directory |

## 🚀 **Implementation Plan**

### **Phase 1: Backup Current Structure**
1. Create backup of all current directories
2. Verify all files are accessible
3. Document current state

### **Phase 2: Create New Structure**
1. Create `D:\safemate_v2` as main repository
2. Create proper subdirectories
3. Set up Git repository in new location

### **Phase 3: Move Files**
1. Move frontend files to `apps/web/safemate/`
2. Move backend services to `services/`
3. Move infrastructure to `terraform/`
4. Move documentation to `docs/`
5. Move shared packages to `shared/`

### **Phase 4: Update References**
1. Update all file paths in documentation
2. Update deployment scripts
3. Update environment configurations
4. Update IDE workspace settings

### **Phase 5: Clean Up**
1. Remove old directories
2. Update shortcuts and bookmarks
3. Update team documentation
4. Verify all functionality works

## ⚠️ **Important Considerations**

### **Before Moving Files:**
- ✅ **Backup everything** - Create full backup before reorganization
- ✅ **Verify Git status** - Commit all changes before moving
- ✅ **Update team** - Notify team members of directory changes
- ✅ **Test functionality** - Verify all services work after move

### **After Moving Files:**
- ✅ **Update documentation** - Update all file paths in docs
- ✅ **Update scripts** - Update deployment and build scripts
- ✅ **Update IDE settings** - Update workspace configurations
- ✅ **Test deployment** - Verify deployment process works

## 📝 **Next Steps**

1. **Review this plan** with the team
2. **Create backup** of current structure
3. **Execute reorganization** step by step
4. **Update all references** to new paths
5. **Test functionality** after reorganization
6. **Update team documentation** with new structure

## 🎯 **Expected Benefits**

- ✅ **Proper GitHub alignment** - Matches repository structure
- ✅ **Better organization** - Clear separation of concerns
- ✅ **Easier navigation** - Standard project structure
- ✅ **Team collaboration** - Consistent with Git workflow
- ✅ **Deployment clarity** - Clear deployment paths
- ✅ **Documentation accuracy** - All paths will be correct

---

**Status**: 📋 **PLANNING PHASE**  
**Priority**: 🔴 **HIGH** - Required for proper GitHub alignment  
**Estimated Time**: 2-3 hours for complete reorganization  
**Risk Level**: 🟡 **MEDIUM** - Requires careful file movement and path updates
