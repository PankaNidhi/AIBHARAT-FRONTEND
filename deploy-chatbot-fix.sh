#!/bin/bash

# Deployment script for Bedrock Chatbot fixes
# This script will push the chatbot fixes to GitHub

set -e  # Exit on any error

echo "=========================================="
echo "Deploying Bedrock Chatbot Fixes"
echo "=========================================="
echo ""

# Step 1: Abort any ongoing rebase
echo "Step 1: Cleaning up git state..."
git rebase --abort 2>/dev/null || echo "No rebase in progress"
echo "✓ Git state cleaned"
echo ""

# Step 2: Change remote URL to correct repository
echo "Step 2: Setting correct remote URL..."
git remote set-url origin https://github.com/PankaNidhi/AIBHARAT-FRONTEND.git
echo "✓ Remote URL updated"
echo ""

# Step 3: Verify remote
echo "Step 3: Verifying remote..."
git remote -v
echo ""

# Step 4: Pull latest from correct repo
echo "Step 4: Pulling latest changes..."
git pull origin main --allow-unrelated-histories || echo "Pull completed with conflicts (if any)"
echo ""

# Step 5: Add chatbot fix files
echo "Step 5: Adding chatbot fix files..."
git add src/services/BedrockChatbotService.ts
git add src/components/SystemChatbot.tsx
git add src/config/api.ts
git add src/lambda/bedrock-chatbot/index.ts
echo "✓ Files added"
echo ""

# Step 6: Commit changes
echo "Step 6: Committing changes..."
git commit -m "Fix Bedrock chatbot CORS and response format issues

- Updated Lambda response format: message -> textResponse, voiceUrl -> audioUrl
- Fixed BedrockChatbotService response parsing (removed data.body access)
- Updated SystemChatbot to access data.textResponse
- Configured correct API endpoint URL with /prod prefix
- Configured API Gateway CORS for OPTIONS requests"
echo "✓ Changes committed"
echo ""

# Step 7: Push to GitHub
echo "Step 7: Pushing to GitHub..."
git push origin main
echo "✓ Pushed to GitHub"
echo ""

echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Wait 5-10 minutes for Amplify to build and deploy"
echo "2. Visit: https://main.dzey7ge9ssydq.amplifyapp.com/"
echo "3. Test the chatbot"
echo "4. Check browser console for any errors"
echo ""
