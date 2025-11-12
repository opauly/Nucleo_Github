# GitHub Setup Guide

## Repository Information
- **Repository URL**: https://github.com/opauly/Nucleo_Github.git
- **Repository Name**: Nucleo_Github
- **Owner**: opauly

## Step 1: How to Obtain GitHub Personal Access Token

### Method 1: Via GitHub Website (Recommended)

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: Click your profile picture → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token" → "Generate new token (classic)"
   - Give it a descriptive name: `Nucleo Website - Local Development`
   - Set expiration: Choose "90 days" or "No expiration" (your choice)

3. **Select Scopes (Permissions)**
   Check the following boxes:
   - ✅ **`repo`** - Full control of private repositories
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`, `security_events`
   - ✅ **`workflow`** - Update GitHub Action workflows (if you use GitHub Actions)
   - ✅ **`write:packages`** - Upload packages (if needed)
   - ✅ **`delete:packages`** - Delete packages (if needed)

4. **Generate Token**
   - Scroll down and click "Generate token"
   - **IMPORTANT**: Copy the token immediately! It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You won't be able to see it again after closing the page
   - Store it securely (password manager recommended)

### Method 2: Via GitHub CLI (if installed)

```bash
gh auth login
```

This will guide you through the process interactively.

## Step 2: Set Up Git Remote

### Check Current Remote
```bash
cd /Users/oscarpauly/Desktop/Núcleo/Website/nucleo-web
git remote -v
```

### If No Remote Exists, Add It:
```bash
git remote add origin https://github.com/opauly/Nucleo_Github.git
```

### If Remote Exists but Points to Wrong URL, Update It:
```bash
git remote set-url origin https://github.com/opauly/Nucleo_Github.git
```

### Verify Remote:
```bash
git remote -v
```

Should show:
```
origin  https://github.com/opauly/Nucleo_Github.git (fetch)
origin  https://github.com/opauly/Nucleo_Github.git (push)
```

## Step 3: Commit and Push Files

### 1. Add Files to Staging
```bash
cd /Users/oscarpauly/Desktop/Núcleo/Website/nucleo-web

# Add all essential files
git add src/
git add public/
git add package.json package-lock.json
git add tsconfig.json tailwind.config.ts postcss.config.mjs
git add eslint.config.mjs next.config.ts next.config.js components.json
git add .gitignore README.md
git add scripts/
git add checkpoints/
git add COMMIT_GUIDE.md GITHUB_SETUP.md
```

### 2. Review What Will Be Committed
```bash
git status
```

### 3. Commit Changes
```bash
git commit -m "feat: Add attendance counter system and admin improvements

- Add service attendance tracking system
- Add attendance counter page for Staff+ users
- Add interactive attendance charts with recharts
- Add team members export functionality (Excel/PDF)
- Reorganize admin dashboard tabs
- Add admin access control to header
- Fix event registration validation for end_date
- Update pending approvals to include event registrations"
```

### 4. Push to GitHub

**First Push (if repository is empty):**
```bash
git push -u origin main
```

**Subsequent Pushes:**
```bash
git push origin main
```

### 5. Authentication

When prompted:
- **Username**: `opauly` (your GitHub username)
- **Password**: Paste your Personal Access Token (NOT your GitHub password)

**Note**: If you're using macOS Keychain, it might store the token automatically.

## Step 4: Verify on GitHub

1. Go to: https://github.com/opauly/Nucleo_Github
2. Check the "Code" tab - you should see all your files
3. Check the "Commits" tab - you should see your commit

## Troubleshooting

### If Push Fails with Authentication Error:

1. **Clear stored credentials:**
   ```bash
   git credential-osxkeychain erase
   host=github.com
   protocol=https
   ```

2. **Try pushing again** - it will prompt for credentials

### If You Get "Repository Not Found" Error:

- Verify the repository exists at: https://github.com/opauly/Nucleo_Github
- Check that you have access to it
- Verify the remote URL is correct: `git remote -v`

### If Token Doesn't Work:

- Make sure you selected the `repo` scope
- Check if the token has expired
- Generate a new token if needed

## Security Best Practices

1. **Never commit tokens or secrets:**
   - ✅ Already in `.gitignore`: `.env*`
   - ✅ Never commit `.env.local`, `.env.production`, etc.

2. **Token Storage:**
   - Use a password manager (1Password, LastPass, etc.)
   - Or use GitHub CLI: `gh auth login` (stores token securely)

3. **Token Rotation:**
   - Rotate tokens periodically (every 90 days recommended)
   - Revoke old tokens when creating new ones

4. **Repository Access:**
   - Only give access to trusted team members
   - Use branch protection rules for `main` branch

## Alternative: Using SSH (More Secure)

If you prefer SSH over HTTPS:

1. **Generate SSH Key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```

2. **Add SSH Key to GitHub:**
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key and save

3. **Change Remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:opauly/Nucleo_Github.git
   ```

4. **Push:**
   ```bash
   git push -u origin main
   ```

No token needed with SSH!


