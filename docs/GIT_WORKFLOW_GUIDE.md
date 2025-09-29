# 🔄 SafeMate Git Workflow Guide

## 📋 **Branch Strategy Overview**

SafeMate uses a **feature-based branching strategy** with team organization for collaborative development.

---

## 🌳 **Branch Structure**

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

---

## 🚀 **Development Workflow**

### **1. Starting Work**
```bash
# Always start from main
git checkout main
git pull origin main

# Create your team branch (if it doesn't exist)
git checkout -b team/wallet-widgets

# Or switch to existing team branch
git checkout team/wallet-widgets
git pull origin team/wallet-widgets
```

### **2. Daily Development**
```bash
# Start your day
git pull origin team/wallet-widgets

# Make your changes
# ... work on your features ...

# Commit your changes
git add .
git commit -m "feat: add new wallet widget functionality"

# Push to your team branch
git push origin team/wallet-widgets
```

### **3. Feature Completion**
```bash
# When your feature is ready for review
git push origin team/wallet-widgets

# Create Pull Request on GitHub:
# team/wallet-widgets → main
```

---

## 🔄 **Merge Process**

### **Pull Request Workflow**
1. **Create Pull Request** from team branch to main
2. **Code Review** by team lead or designated reviewer
3. **Address Feedback** if any changes requested
4. **Merge to Main** when approved
5. **Deploy to Production** from main branch

### **Merge Commands**
```bash
# After PR is approved and merged
git checkout main
git pull origin main

# Update your team branch with latest main
git checkout team/wallet-widgets
git merge main
git push origin team/wallet-widgets
```

---

## 📝 **Branch Naming Standards**

### **Team Branches**
```
team/[feature-area]
Examples:
- team/wallet-widgets
- team/analytics-widgets
- team/files-widgets
```

### **Feature Branches**
```
feature/[descriptive-name]
Examples:
- feature/user-authentication
- feature/file-upload
- feature/wallet-integration
```

### **Bug Fix Branches**
```
bugfix/[issue-description]
Examples:
- bugfix/login-error
- bugfix/file-upload-failure
```

### **Hotfix Branches**
```
hotfix/[urgent-fix-description]
Examples:
- hotfix/security-vulnerability
- hotfix/critical-api-failure
```

---

## 🎯 **Team Responsibilities**

### **Team Members**
- Work on assigned team branches
- Create feature branches for individual work
- Submit Pull Requests for review
- Keep branches up to date with main

### **Team Leads**
- Review Pull Requests
- Merge approved changes to main
- Coordinate with other teams
- Maintain branch hygiene

### **DevOps/Deployment**
- Deploy only from main branch
- Monitor deployment health
- Handle hotfixes for production issues

---

## 🚨 **Important Rules**

### **✅ DO:**
- Always work on team branches, never directly on main
- Pull latest changes before starting work
- Write descriptive commit messages
- Create Pull Requests for all changes
- Review code before merging
- Keep branches focused on specific features

### **❌ DON'T:**
- Commit directly to main
- Work on multiple features in one branch
- Merge without code review
- Leave branches unmerged for too long
- Use unclear commit messages

---

## 🔧 **Useful Commands**

### **Branch Management**
```bash
# List all branches
git branch -a

# Create new branch
git checkout -b team/new-feature

# Switch branches
git checkout team/wallet-widgets

# Delete local branch
git branch -d feature/old-feature

# Delete remote branch
git push origin --delete feature/old-feature
```

### **Status and History**
```bash
# Check current status
git status

# View commit history
git log --oneline -10

# See differences between branches
git diff main..team/wallet-widgets

# See commits in team branch not in main
git log --oneline main..team/wallet-widgets
```

### **Sync and Update**
```bash
# Update main branch
git checkout main
git pull origin main

# Update team branch with main
git checkout team/wallet-widgets
git merge main

# Push updates
git push origin team/wallet-widgets
```

---

## 📊 **Current Branch Status**

### **Active Development Branches**
- `team/wallet-widgets` - **ACTIVE** (new modular system)
- `team/analytics-widgets` - Ready for development
- `team/files-widgets` - Ready for development
- `team/groups-widgets` - Ready for development
- `team/nft-widgets` - Ready for development

### **Next Steps**
1. **Merge team/wallet-widgets to main** (after review)
2. **Set up other team branches** for parallel development
3. **Establish regular merge schedule**
4. **Create team-specific development guides**

---

## 🆘 **Troubleshooting**

### **Merge Conflicts**
```bash
# If you get merge conflicts
git status  # See conflicted files
# Edit files to resolve conflicts
git add .   # Mark conflicts as resolved
git commit  # Complete the merge
```

### **Lost Changes**
```bash
# Recover lost commits
git reflog
git checkout [commit-hash]

# Reset to previous state
git reset --hard HEAD~1
```

### **Branch Cleanup**
```bash
# Clean up merged branches
git branch --merged main | grep -v main | xargs git branch -d
```

---

**Remember: Always work on team branches and merge through Pull Requests!**
