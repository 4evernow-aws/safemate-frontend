# 🚀 Team Member Quick Setup Guide

## 📋 **First Time Setup**

### **1. Clone the Repository**
```bash
git clone https://github.com/4evernow-aws/safemate_v2.git
cd safemate_v2
```

### **2. Get All Branches**
```bash
git fetch origin
```

### **3. Checkout Your Team Branch**

**For Wallet Team:**
```bash
git checkout team/wallet-widgets
```

**For Analytics Team:**
```bash
git checkout team/analytics-widgets
```

**For Files Team:**
```bash
git checkout team/files-widgets
```

**For Groups Team:**
```bash
git checkout team/groups-widgets
```

**For NFT Team:**
```bash
git checkout team/nft-widgets
```

**For Shared Components Team:**
```bash
git checkout team/shared-components
```

---

## 🔄 **Daily Workflow**

### **Start of Day:**
```bash
# Get latest main branch
git checkout main
git pull origin main

# Update your team branch with latest main
git checkout team/wallet-widgets  # (your team branch)
git merge main
```

### **During Development:**
```bash
# Make your changes
# ... work on features ...

# Commit your changes
git add .
git commit -m "feat: add new functionality"

# Push to your team branch
git push origin team/wallet-widgets  # (your team branch)
```

### **End of Day:**
```bash
# Make sure everything is pushed
git push origin team/wallet-widgets  # (your team branch)
```

---

## 🎯 **Team Assignments**

| Team | Branch | Focus Area |
|------|--------|------------|
| **Wallet Team** | `team/wallet-widgets` | Wallet functionality, transactions |
| **Analytics Team** | `team/analytics-widgets` | Reports, charts, metrics |
| **Files Team** | `team/files-widgets` | File management, uploads |
| **Groups Team** | `team/groups-widgets` | Group collaboration, sharing |
| **NFT Team** | `team/nft-widgets` | NFT management, collections |
| **Shared Components** | `team/shared-components` | Reusable UI components |

---

## ⚠️ **Important Rules**

### **✅ DO:**
- Always work on your team branch
- Pull latest main before starting work
- Create Pull Requests when ready to merge
- Write descriptive commit messages

### **❌ DON'T:**
- Work directly on main branch
- Merge without Pull Request
- Leave work uncommitted overnight

---

## 🔧 **Useful Commands**

```bash
# Check which branch you're on
git branch

# See all branches
git branch -a

# Check status
git status

# See recent commits
git log --oneline -5
```

---

## 🆘 **Need Help?**

1. **Check the full workflow guide:** `documentation/GIT_WORKFLOW_GUIDE.md`
2. **Check team development guide:** `documentation/TEAM_DEVELOPMENT_GUIDE.md`
3. **Ask your team lead for guidance**

---

**Remember: Always work on your team branch, never on main!** 🎯
