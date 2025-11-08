# Manual Git Push Instructions

## Step-by-Step Guide

### Step 1: Open Terminal
Open Terminal on your Mac (Applications → Utilities → Terminal)

### Step 2: Navigate to Project Directory
```bash
cd /Users/oscarpauly/Desktop/Núcleo/Website/nucleo-web
```

### Step 3: Verify Current Status
```bash
git status
```
You should see "On branch main" and "nothing to commit"

### Step 4: Check Your Commits
```bash
git log --oneline -3
```
You should see:
- `3a24808 feat: Add attendance counter system and admin improvements`
- `9188589 Initial commit from Create Next App`

### Step 5: Verify Remote Configuration
```bash
git remote -v
```
Should show:
```
origin  https://github.com/opauly/Nucleo_Github.git (fetch)
origin  https://github.com/opauly/Nucleo_Github.git (push)
```

### Step 6: Push to GitHub

**Option A: Using Token in URL (One-time push)**
```bash
git push https://opauly:YOUR_TOKEN_HERE@github.com/opauly/Nucleo_Github.git main
```
Replace `YOUR_TOKEN_HERE` with your actual GitHub Personal Access Token.

**Option B: Using Git Credential Helper**
```bash
# First, set up credential helper
git config credential.helper store

# Then push (it will prompt for credentials)
git push -u origin main
```
When prompted:
- **Username**: `opauly`
- **Password**: `YOUR_TOKEN_HERE` (use your GitHub Personal Access Token, not your password)

**Option C: Using macOS Keychain**
```bash
# Store credentials in keychain
git credential-osxkeychain store <<EOF
protocol=https
host=github.com
username=opauly
password=YOUR_TOKEN_HERE
EOF
```
Replace `YOUR_TOKEN_HERE` with your actual GitHub Personal Access Token.

# Then push
git push -u origin main
```

### Step 7: Verify Push Success
After pushing, verify on GitHub:
1. Go to: https://github.com/opauly/Nucleo_Github
2. Check the "Code" tab - you should see all your files
3. Check the "Commits" tab - you should see your 2 commits

### Step 8: Clean Up (After Successful Push)
If you used Option A (token in URL), reset the remote:
```bash
git remote set-url origin https://github.com/opauly/Nucleo_Github.git
```

## Troubleshooting

### If you get "Authentication failed":
1. Verify token is correct and has `repo` scope: https://github.com/settings/tokens
2. Check token is not expired
3. Ensure token has proper permissions

### If you get "Repository not found":
1. Verify repository exists: https://github.com/opauly/Nucleo_Github
2. Check you have access to the repository
3. Verify the repository name is correct

### If you get "Everything up-to-date":
This means the commits are already on the remote. Check GitHub to confirm.

### If you get HTTP 400 error:
1. Try using SSH instead (see SSH setup below)
2. Check if repository has branch protection rules
3. Verify token permissions include `repo` scope

## Alternative: SSH Setup (Most Secure)

### 1. Check if you have SSH keys
```bash
ls -la ~/.ssh
```

### 2. Generate SSH key (if needed)
```bash
ssh-keygen -t ed25519 -C "opaulyc@gmail.com"
```
Press Enter to accept default location and optionally set a passphrase.

### 3. Copy your public key
```bash
cat ~/.ssh/id_ed25519.pub
```
Copy the entire output (starts with `ssh-ed25519`)

### 4. Add SSH key to GitHub
1. Go to: https://github.com/settings/keys
2. Click "New SSH key"
3. Title: "Mac - Nucleo Project"
4. Paste your public key
5. Click "Add SSH key"

### 5. Change remote to SSH
```bash
git remote set-url origin git@github.com:opauly/Nucleo_Github.git
```

### 6. Test SSH connection
```bash
ssh -T git@github.com
```
You should see: "Hi opauly! You've successfully authenticated..."

### 7. Push using SSH
```bash
git push -u origin main
```

## Quick Reference

**Repository**: `https://github.com/opauly/Nucleo_Github.git`  
**Branch**: `main`  
**Commits to push**: 2 commits (195 files)

**Note**: Never commit tokens or secrets to the repository. Always use placeholders in documentation.

