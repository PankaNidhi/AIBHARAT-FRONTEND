#!/bin/bash

# Git Repository Fix Script
# This script fixes the git repository structure by:
# 1. Removing git from Downloads folder
# 2. Initializing git in the project folder
# 3. Committing all files with correct paths
# 4. Force pushing to GitHub

set -e  # Exit on error

echo "========================================="
echo "Git Repository Fix Script"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check current location
echo -e "${YELLOW}Step 1: Checking current location...${NC}"
CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"

if [[ ! "$CURRENT_DIR" == *"AIBHARAT-FRONTEND-main" ]]; then
    echo -e "${RED}ERROR: This script must be run from the AIBHARAT-FRONTEND-main directory${NC}"
    echo "Please run: cd ~/Downloads/AIBHARAT-FRONTEND-main"
    exit 1
fi

# Step 2: Check if git exists in parent directory
echo ""
echo -e "${YELLOW}Step 2: Checking for git in parent directory...${NC}"
if [ -d "../.git" ]; then
    echo -e "${RED}WARNING: Git repository found in parent directory (Downloads)${NC}"
    echo "This needs to be removed to fix the issue."
    echo ""
    read -p "Do you want to remove git from Downloads folder? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
        echo -e "${RED}Aborted. Cannot proceed without removing git from Downloads.${NC}"
        exit 1
    fi
    
    echo "Removing git from Downloads folder..."
    rm -rf ../.git
    echo -e "${GREEN}✓ Removed git from Downloads folder${NC}"
else
    echo -e "${GREEN}✓ No git repository in parent directory${NC}"
fi

# Step 3: Check if git exists in current directory
echo ""
echo -e "${YELLOW}Step 3: Checking for git in current directory...${NC}"
if [ -d ".git" ]; then
    echo -e "${YELLOW}Git repository already exists in current directory${NC}"
    read -p "Do you want to remove it and start fresh? (yes/no): " CONFIRM_REINIT
    
    if [ "$CONFIRM_REINIT" == "yes" ]; then
        echo "Removing existing git repository..."
        rm -rf .git
        echo -e "${GREEN}✓ Removed existing git repository${NC}"
    fi
fi

# Step 4: Initialize git in current directory
echo ""
echo -e "${YELLOW}Step 4: Initializing git in project directory...${NC}"
if [ ! -d ".git" ]; then
    git init
    echo -e "${GREEN}✓ Initialized git repository${NC}"
else
    echo -e "${GREEN}✓ Git repository already initialized${NC}"
fi

# Step 5: Add remote
echo ""
echo -e "${YELLOW}Step 5: Setting up GitHub remote...${NC}"
REMOTE_URL="https://github.com/PankaNidhi/AIBHARAT-FRONTEND.git"

# Remove existing remote if it exists
git remote remove origin 2>/dev/null || true

# Add remote
git remote add origin "$REMOTE_URL"
echo -e "${GREEN}✓ Added remote: $REMOTE_URL${NC}"

# Step 6: Add all files
echo ""
echo -e "${YELLOW}Step 6: Adding all project files...${NC}"
git add .
echo -e "${GREEN}✓ Added all files to git${NC}"

# Step 7: Show status
echo ""
echo -e "${YELLOW}Step 7: Checking git status...${NC}"
git status --short | head -20
echo ""
TOTAL_FILES=$(git status --short | wc -l | tr -d ' ')
echo "Total files to commit: $TOTAL_FILES"

# Step 8: Commit
echo ""
echo -e "${YELLOW}Step 8: Creating commit...${NC}"
git commit -m "Initial commit: AI Climate Control Dashboard React application

- Complete React + TypeScript + Vite application
- AWS Bedrock chatbot integration with CORS fixes
- Multi-module dashboard (Waste, Cement, Steel)
- MRV data collection and scenario modeling
- IoT sensor integration
- All configuration files included
- Fixed git repository structure"

echo -e "${GREEN}✓ Created commit${NC}"

# Step 9: Confirm force push
echo ""
echo -e "${RED}=========================================${NC}"
echo -e "${RED}WARNING: FORCE PUSH${NC}"
echo -e "${RED}=========================================${NC}"
echo ""
echo "This will REPLACE the content in the GitHub repository:"
echo "  Repository: $REMOTE_URL"
echo "  Branch: main"
echo ""
echo "The personal website/blog content will be replaced with the React project."
echo ""
read -p "Are you sure you want to force push? (yes/no): " CONFIRM_PUSH

if [ "$CONFIRM_PUSH" != "yes" ]; then
    echo -e "${YELLOW}Aborted. Commit created but not pushed.${NC}"
    echo "You can manually push later with: git push -f origin main"
    exit 0
fi

# Step 10: Force push
echo ""
echo -e "${YELLOW}Step 10: Force pushing to GitHub...${NC}"
git push -f origin main

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}SUCCESS!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Git repository has been fixed and pushed to GitHub."
echo ""
echo "Next steps:"
echo "1. Check Amplify console for deployment status"
echo "2. Verify the build finds package.json"
echo "3. Test the deployed application"
echo ""
echo "Repository URL: https://github.com/PankaNidhi/AIBHARAT-FRONTEND"
echo "Website URL: https://main.dzey7ge9ssydq.amplifyapp.com/"
