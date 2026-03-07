# Bugfix Requirements Document

## Introduction

The Bedrock chatbot functionality is currently non-functional due to CORS policy violations and incorrect API endpoint configuration. When users attempt to send messages to the chatbot, the browser blocks the request with a CORS error stating "Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource." This results in a "Failed to fetch" error and the user sees "Error: Unable to reach Bedrock service."

The root causes include:
- Missing or incorrect CORS headers in API Gateway responses to OPTIONS preflight requests
- Incorrect API endpoint URL (missing `/prod` path prefix)
- Response format mismatch between Lambda function and frontend expectations

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user sends a message to the chatbot THEN the browser makes a preflight OPTIONS request to `https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com/bedrock-chatbot` which fails with CORS error "No 'Access-Control-Allow-Origin' header is present"

1.2 WHEN the preflight request fails THEN the actual POST request is blocked by the browser and never reaches the Lambda function

1.3 WHEN the request is blocked THEN the user sees error message "Error: Unable to reach Bedrock service. Failed to fetch" in the chat interface

1.4 WHEN the Lambda function returns a response THEN the response format is `{ message: string, voiceUrl?: string, analysis?: any }` but the frontend expects `{ textResponse: string, audioUrl?: string, analysis: ChatbotAnalysis }`

1.5 WHEN BedrockChatbotService attempts to parse the response THEN it tries to access `data.body` which doesn't exist in the Lambda response structure

### Expected Behavior (Correct)

2.1 WHEN a user sends a message to the chatbot THEN the browser's preflight OPTIONS request SHALL receive proper CORS headers including `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers`

2.2 WHEN the preflight request succeeds THEN the actual POST request SHALL be sent to the correct endpoint `https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com/prod/bedrock-chatbot` and reach the Lambda function

2.3 WHEN the Lambda function processes the request successfully THEN the user SHALL see the chatbot's response displayed in the chat interface without any errors

2.4 WHEN the Lambda function returns a response THEN the response format SHALL match what the frontend expects: `{ textResponse: string, audioUrl?: string, analysis: ChatbotAnalysis }`

2.5 WHEN BedrockChatbotService receives the response THEN it SHALL successfully parse the response without attempting to access non-existent properties

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the chatbot successfully processes a message THEN the system SHALL CONTINUE TO invoke the Bedrock Claude 3 Haiku model in ap-south-1 region

3.2 WHEN the Lambda function generates a response THEN the system SHALL CONTINUE TO include voice URL and analysis data when available

3.3 WHEN the chatbot displays messages THEN the system SHALL CONTINUE TO show the conversation history and user interface elements correctly

3.4 WHEN other API endpoints are called THEN the system SHALL CONTINUE TO function without being affected by the chatbot CORS fix
