# Git Repository Fix Guide

## Current Problem

1. Git is initialized in `/Users/pravinkumar/Downloads/` (parent directory), not in the project folder
2. This causes git to track the entire Downloads folder as untracked files
3. Files were committed with wrong path prefix `AIBHARAT-FRONTEND-main/`
4. The GitHub repository contains personal website/blog content, NOT the React project
5. Amplify deployments fail because `package.json` and other root files are missing

## Solution: Initialize Git in Project Folder

### Step 1: Remove Git from Downloads Folder (CRITICAL)

```bash
# Navigate to Downloads folder
cd ~/Downloads

# Remove the .git folder (this will NOT delete any files, only git history)
rm -rf .git

# Verify it's gone
ls -la .git  # Should show "No such file or directory"
```

### Step 2: Initialize Git in Project Folder

```bash
# Navigate to the React project folder
cd ~/Downloads/AIBHARAT-FRONTEND-main

# Initialize git in THIS folder
git init

# Add the GitHub remote
git remote add origin https://github.com/PankaNidhi/AIBHARAT-FRONTEND.git

# Verify remote is set
git remote -v
```

### Step 3: Add All Project Files

```bash
# Add all files to git
git add .

# Check what will be committed
git status

# You should see all the React project files, NOT the entire Downloads folder
```

### Step 4: Commit and Force Push

```bash
# Commit all files
git commit -m "Initial commit: AI Climate Control Dashboard React application

- Complete React + TypeScript + Vite application
- AWS Bedrock chatbot integration with CORS fixes
- Multi-module dashboard (Waste, Cement, Steel)
- MRV data collection and scenario modeling
- IoT sensor integration
- All configuration files included"

# Force push to replace the personal website content
git push -f origin main
```

### Step 5: Verify Amplify Deployment

After pushing, check the Amplify console:
- The build should now find `package.json`
- The build should complete successfully
- The website should deploy the React application

## What This Does

1. **Removes git from Downloads**: Stops tracking the entire Downloads folder
2. **Initializes git in project**: Only tracks the React project files
3. **Replaces GitHub content**: The personal website will be replaced with the React project
4. **Fixes Amplify**: All required files (`package.json`, `amplify.yml`, etc.) will be in the repository root

## Verification Commands

After completing the steps, verify:

```bash
# Check current directory
pwd  # Should show: /Users/pravinkumar/Downloads/AIBHARAT-FRONTEND-main

# Check git status
git status  # Should show "On branch main" with clean working tree

# Check tracked files
git ls-files | head -20  # Should show project files WITHOUT "AIBHARAT-FRONTEND-main/" prefix

# Check remote
git remote -v  # Should show GitHub repository URL
```

## Important Notes

1. **This will replace the personal website**: The GitHub repository will contain the React project, not the blog
2. **No data loss**: Your Downloads folder files are safe, we're only removing git tracking
3. **Backup recommended**: If you want to keep the personal website, clone it first:
   ```bash
   cd ~/Projects
   git clone https://github.com/PankaNidhi/AIBHARAT-FRONTEND.git AIBHARAT-WEBSITE-BACKUP
   ```

## Alternative: Create New Repository

If you want to keep the personal website in the current repository, create a new one:

1. Go to GitHub and create a new repository (e.g., `AIBHARAT-CLIMATE-DASHBOARD`)
2. Follow steps 2-4 above, but use the new repository URL
3. Update Amplify to point to the new repository
