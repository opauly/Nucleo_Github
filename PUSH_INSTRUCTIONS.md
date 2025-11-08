# Manual Push Instructions

Since automated push is having issues, here are manual steps:

## Option 1: Push via Terminal (Recommended)

1. **Open Terminal** and navigate to the project:
   ```bash
   cd /Users/oscarpauly/Desktop/Núcleo/Website/nucleo-web
   ```

2. **Push using token in URL** (one-time):
   ```bash
   git push https://opauly:YOUR_TOKEN_HERE@github.com/opauly/Nucleo_Github.git main
   ```
   Replace `YOUR_TOKEN_HERE` with your actual GitHub Personal Access Token.

3. **Reset remote URL** (after successful push):
   ```bash
   git remote set-url origin https://github.com/opauly/Nucleo_Github.git
   ```

## Option 2: Use GitHub Desktop

1. Install GitHub Desktop: https://desktop.github.com/
2. Add repository
3. Sign in with your GitHub account
4. Push using the GUI

## Option 3: Verify Token Permissions

1. Go to: https://github.com/settings/tokens
2. Find your token and verify it has:
   - ✅ `repo` scope checked
   - ✅ Not expired
   - ✅ Active status

## Option 4: Use SSH (Most Secure)

1. **Generate SSH Key** (if you don't have one):
   ```bash
   ssh-keygen -t ed25519 -C "opaulyc@gmail.com"
   ```

2. **Add SSH Key to GitHub**:
   - Copy public key: `cat ~/.ssh/id_ed25519.pub`
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste and save

3. **Change Remote to SSH**:
   ```bash
   git remote set-url origin git@github.com:opauly/Nucleo_Github.git
   git push -u origin main
   ```

## Current Status

- ✅ **Local commits**: 2 commits ready to push
- ✅ **Files committed**: 195 files, 31,664 insertions
- ⚠️ **Push status**: HTTP 400 error (authentication issue)

## Troubleshooting

If you still get HTTP 400:
1. Verify token has `repo` scope
2. Check if repository exists: https://github.com/opauly/Nucleo_Github
3. Try creating a new token
4. Use SSH instead of HTTPS

