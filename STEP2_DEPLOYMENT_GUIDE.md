# Step 2: Deploy Frontend to GitHub/Amplify

## Current Situation

Your git repository is in the middle of a rebase operation. We need to resolve this first before pushing the chatbot fixes.

---

## Option 1: Abort Rebase and Start Fresh (RECOMMENDED)

This is the safest and cleanest approach:

```bash
# 1. Abort the current rebase
git rebase --abort

# 2. Check current branch
git branch

# 3. Make sure you're on main branch
git checkout main

# 4. Pull latest changes from GitHub
git pull origin main

# 5. Add ONLY the chatbot fix files
git add src/services/BedrockChatbotService.ts
git add src/components/SystemChatbot.tsx
git add src/config/api.ts
git add src/lambda/bedrock-chatbot/index.ts

# 6. Commit the changes
git commit -m "Fix Bedrock chatbot CORS and response format issues

- Updated Lambda response format: message -> textResponse, voiceUrl -> audioUrl
- Fixed BedrockChatbotService response parsing (removed data.body access)
- Updated SystemChatbot to access data.textResponse
- Configured correct API endpoint URL with /prod prefix
- Configured API Gateway CORS for OPTIONS requests"

# 7. Push to GitHub (this will trigger Amplify deployment)
git push origin main
```

---

## Option 2: Continue with Rebase (Advanced)

Only use this if you know what you're doing with git rebase:

```bash
# 1. Resolve the merge conflict in ../README.md
git rm ../README.md

# 2. Continue the rebase
git rebase --continue

# 3. If more conflicts appear, resolve them and continue
# Repeat until rebase is complete

# 4. Then add and commit the chatbot fixes
git add src/services/BedrockChatbotService.ts
git add src/components/SystemChatbot.tsx
git add src/config/api.ts
git add src/lambda/bedrock-chatbot/index.ts

git commit -m "Fix Bedrock chatbot CORS and response format issues"

# 5. Push to GitHub
git push origin main --force-with-lease
```

---

## What Files Are Being Deployed?

These are the 4 files with chatbot fixes:

1. **src/services/BedrockChatbotService.ts**
   - Fixed: Removed `JSON.parse(data.body || data)` → Changed to `const result = data`
   - Now correctly parses Lambda response

2. **src/components/SystemChatbot.tsx**
   - Fixed: Changed `data.message` → `data.textResponse`
   - Now correctly accesses response property

3. **src/config/api.ts**
   - Fixed: Updated BASE_URL to correct endpoint with `/prod` prefix
   - Now uses: `https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com/prod`

4. **src/lambda/bedrock-chatbot/index.ts**
   - Fixed: Response format matches frontend expectations
   - Changed: `message` → `textResponse`, `voiceUrl` → `audioUrl`

---

## After Pushing to GitHub

1. **Amplify will automatically detect the push**
   - Build will start within 1-2 minutes
   - You'll see the build progress in AWS Amplify Console

2. **Monitor the deployment**
   - Go to: https://console.aws.amazon.com/amplify/
   - Click on your app
   - Watch the build progress (takes 5-10 minutes)

3. **Verify deployment**
   - Once build completes, visit: https://main.dzey7ge9ssydq.amplifyapp.com/
   - Open the chatbot (bottom right corner)
   - Send a test message
   - Check browser console (F12) for any errors

---

## Troubleshooting

### If git push fails with "rejected" error:

```bash
# Pull latest changes first
git pull origin main --rebase

# Then push again
git push origin main
```

### If you see "divergent branches" error:

```bash
# Force push (use with caution!)
git push origin main --force-with-lease
```

### If Amplify build fails:

1. Check the build logs in Amplify Console
2. Common issues:
   - Missing environment variables (VITE_API_URL)
   - Build errors in TypeScript
   - Missing dependencies

---

## Expected Timeline

- Git push: Instant
- Amplify detects push: 1-2 minutes
- Amplify build: 5-10 minutes
- Total time: ~10-15 minutes

---

## Verification Checklist

After deployment completes:

- [ ] Website loads: https://main.dzey7ge9ssydq.amplifyapp.com/
- [ ] Chatbot button appears (bottom right)
- [ ] Chatbot opens when clicked
- [ ] Can type and send messages
- [ ] Chatbot responds without errors
- [ ] No CORS errors in browser console
- [ ] Response displays correctly in chat

---

## Need Help?

If you encounter any issues:
1. Share the error message
2. Check browser console for errors (F12)
3. Check Amplify build logs
4. Verify Lambda function was updated in Step 1
