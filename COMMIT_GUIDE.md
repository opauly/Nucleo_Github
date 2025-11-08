# Git Commit Guide - Essential Files

## Essential Files to Commit

### Configuration Files
- `.gitignore` (updated)
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `next.config.ts`
- `next.config.js` (if exists)
- `components.json`

### Source Code
- `src/app/**/*.tsx` (all pages and layouts)
- `src/app/**/*.ts` (all API routes)
- `src/components/**/*.tsx` (all components)
- `src/lib/**/*.ts` (all utilities and libraries)
- `src/app/globals.css`

### Public Assets
- `public/logo_black.png`
- `public/logo_white.png`
- `public/img/**` (all images)
- `public/*.svg` (SVG icons)

### Documentation
- `README.md`
- `checkpoints/**` (checkpoint documentation)

### Scripts
- `scripts/**/*.js` (utility scripts)

### References (Optional - can be excluded if large)
- `references/**` (PDF/Excel files - consider excluding if too large)

## Files to EXCLUDE (already in .gitignore)
- `node_modules/`
- `.next/`
- `.env*` (environment variables)
- `*.log`
- `.DS_Store`
- `*.sql` (except schema files if needed)

## Git Commit Process

### Step 1: Check Current Status
```bash
cd /Users/oscarpauly/Desktop/Núcleo/Website/nucleo-web
git status
```

### Step 2: Add Essential Files
```bash
# Add all source code and configuration
git add src/
git add public/
git add package.json package-lock.json
git add tsconfig.json tailwind.config.ts postcss.config.mjs
git add eslint.config.mjs next.config.ts next.config.js components.json
git add .gitignore README.md
git add scripts/
git add checkpoints/
```

### Step 3: Review What Will Be Committed
```bash
git status
```

### Step 4: Commit Changes
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

### Step 5: Push to GitHub

**Option A: Using HTTPS (requires Personal Access Token)**
```bash
git push origin main
```
When prompted, use your GitHub Personal Access Token as the password.

**Option B: Using SSH (if configured)**
```bash
git push origin main
```

## GitHub Personal Access Token Setup

### How to Create a Personal Access Token:

1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "Nucleo Website")
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (if using GitHub Actions)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

### Security Note:
- Never commit the token to the repository
- Store it securely (password manager)
- If token is exposed, revoke it immediately and create a new one

## Alternative: Using GitHub CLI

If you have GitHub CLI installed:
```bash
gh auth login
git push origin main
```

## Verify Commit

After pushing, verify on GitHub:
1. Go to your repository on GitHub
2. Check the "Commits" tab
3. Verify all files are present

