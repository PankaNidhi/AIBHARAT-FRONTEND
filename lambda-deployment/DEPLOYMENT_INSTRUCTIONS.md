# Lambda Function Deployment Instructions

## What Changed?

### ❌ OLD CODE (Current in AWS Lambda):
```javascript
const response = {
  message: analysis,        // WRONG property name
  voiceUrl,                 // WRONG property name
  analysis: { ... }
};
```

### ✅ NEW CODE (Fixed):
```javascript
const response = {
  textResponse: analysis,   // CORRECT property name
  audioUrl,                 // CORRECT property name
  analysis: { ... }
};
```

## Why This Matters

The frontend expects:
- `data.textResponse` (not `data.message`)
- `data.audioUrl` (not `data.voiceUrl`)

Without this fix, the chatbot will fail to display responses.

---

## Deployment Steps

### Option 1: AWS Console (Recommended - 2 minutes)

1. **Open AWS Lambda Console**
   - Go to: https://ap-south-1.console.aws.amazon.com/lambda/home?region=ap-south-1#/functions
   - Sign in with your AWS credentials

2. **Find Your Function**
   - Look for your bedrock-chatbot Lambda function
   - Click on the function name

3. **Update the Code**
   - Click on the "Code" tab
   - Find the file `dist/index.js` in the file tree (left side)
   - Click on it to open
   - **Select ALL the code** (Cmd+A or Ctrl+A)
   - **Delete it**
   - **Copy the ENTIRE contents** from `lambda-deployment/index.js` (this file)
   - **Paste it** into the Lambda editor

4. **Deploy**
   - Click the "Deploy" button (orange button at top right)
   - Wait for "Successfully updated the function" message

5. **Test (Optional but Recommended)**
   - Click the "Test" tab
   - Click "Create new event"
   - Name it: "ChatbotTest"
   - Use this JSON:
   ```json
   {
     "body": "{\"userMessage\":\"What is the status?\",\"systemData\":{\"facilityId\":\"facility001\"},\"enableVoice\":false}"
   }
   ```
   - Click "Save"
   - Click "Test"
   - **Verify the response has `textResponse` property** (not `message`)

---

### Option 2: AWS CLI (If you prefer command line)

```bash
# Navigate to the deployment folder
cd lambda-deployment

# Create a zip file
zip function.zip index.js

# Deploy to AWS (replace with your actual function name if different)
aws lambda update-function-code \
  --function-name bedrock-chatbot \
  --zip-file fileb://function.zip \
  --region ap-south-1

# Clean up
rm function.zip
```

---

## Verification

After deployment, the Lambda function should return responses like:

```json
{
  "textResponse": "Your response text here",
  "audioUrl": "",
  "analysis": {
    "timestamp": "2026-03-07T...",
    "model": "Claude 3 Haiku (APAC Inference Profile)",
    "systemDataIncluded": true
  }
}
```

**NOT** like this (old format):
```json
{
  "message": "Your response text here",  // ❌ Wrong
  "voiceUrl": "",                        // ❌ Wrong
  "analysis": { ... }
}
```

---

## Next Steps

After deploying the Lambda function:
1. ✅ Lambda function updated (you just did this)
2. ⏳ Push frontend changes to GitHub (Step 2)
3. ⏳ Wait for Amplify to deploy (automatic, ~5-10 minutes)
4. ⏳ Test the chatbot on your website

---

## Troubleshooting

**If the test fails:**
- Check CloudWatch Logs for errors
- Verify the function has Bedrock permissions
- Ensure the model ID is correct: `anthropic.claude-3-haiku-20240307-v1:0`

**If you see "model access not approved":**
- The function will use mock responses for testing
- Request Bedrock model access in AWS Console
