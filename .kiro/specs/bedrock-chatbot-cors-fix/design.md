# Bedrock Chatbot CORS and Configuration Fix Design

## Overview

The Bedrock chatbot is non-functional due to three interconnected issues: missing CORS headers in API Gateway responses to preflight OPTIONS requests, incorrect API endpoint URL configuration (missing `/prod` path prefix), and response format mismatch between the Lambda function and frontend expectations. The fix requires configuring API Gateway to properly handle CORS preflight requests, ensuring consistent endpoint URLs across the codebase, and aligning the Lambda response format with frontend expectations. This is a minimal, targeted fix that preserves all existing chatbot functionality while enabling cross-origin requests from the browser.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when a user sends a chatbot message, causing a preflight OPTIONS request that fails due to missing CORS headers, or when the response format doesn't match frontend expectations
- **Property (P)**: The desired behavior - preflight OPTIONS requests receive proper CORS headers, POST requests use the correct endpoint URL with `/prod` prefix, and Lambda responses match the format expected by the frontend
- **Preservation**: Existing chatbot functionality including Claude 3 Haiku model invocation, voice URL generation, analysis data inclusion, and conversation history display
- **handleKeyPress**: Not applicable to this bugfix (this is a chatbot CORS issue, not a keyboard handler issue)
- **BedrockChatbotService**: The service class in `src/services/BedrockChatbotService.ts` that manages chatbot API calls and conversation history
- **SystemChatbot**: The React component in `src/components/SystemChatbot.tsx` that renders the chatbot UI
- **Lambda handler**: The function in `src/lambda/bedrock-chatbot/index.ts` that processes chatbot requests using AWS Bedrock Claude 3 Haiku
- **Preflight Request**: Browser-initiated OPTIONS request that checks CORS permissions before sending the actual POST request
- **API Gateway**: AWS service that routes HTTP requests to Lambda functions and must be configured to return proper CORS headers

## Bug Details

### Fault Condition

The bug manifests when a user sends a message to the chatbot. The browser first sends a preflight OPTIONS request to verify CORS permissions, but API Gateway either doesn't have an OPTIONS method configured or returns a response without the required `Access-Control-Allow-Origin` header. This causes the browser to block the subsequent POST request. Additionally, the frontend may be using an incorrect endpoint URL (missing `/prod` prefix) or the Lambda response format doesn't match what the frontend expects.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { requestType: 'OPTIONS' | 'POST', endpoint: string, responseFormat: object }
  OUTPUT: boolean
  
  RETURN (input.requestType == 'OPTIONS' 
          AND corsHeadersMissing(input.endpoint))
         OR (input.requestType == 'POST' 
             AND NOT input.endpoint.includes('/prod/bedrock-chatbot'))
         OR (input.responseFormat.hasOwnProperty('message') 
             AND NOT input.responseFormat.hasOwnProperty('textResponse'))
END FUNCTION
```

### Examples

- **CORS Preflight Failure**: User clicks send on chatbot message → Browser sends OPTIONS request to `https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com/bedrock-chatbot` → API Gateway returns 403 or response without `Access-Control-Allow-Origin` header → Browser blocks request → User sees "Error: Unable to reach Bedrock service. Failed to fetch"

- **Incorrect Endpoint URL**: BedrockChatbotService calls `${API_CONFIG.BASE_URL}/bedrock-chatbot` where BASE_URL is `https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com` (missing `/prod`) → Request goes to wrong endpoint → 404 or routing error → User sees error message

- **Response Format Mismatch**: Lambda returns `{ message: "response text", voiceUrl: null, analysis: {...} }` → Frontend tries to access `data.body` or expects `textResponse` property → Parsing fails → User sees error or undefined response

- **Edge Case - Successful CORS but Wrong Format**: OPTIONS request succeeds with proper CORS headers → POST request reaches Lambda → Lambda returns response with `message` instead of `textResponse` → Frontend code `result.textResponse` is undefined → Chatbot displays empty or error message

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Claude 3 Haiku model invocation in ap-south-1 region must continue to work exactly as before
- Voice URL generation logic (even though it returns empty string) must remain unchanged
- Analysis data structure with timestamp, model name, and systemDataIncluded flag must be preserved
- Conversation history management in BedrockChatbotService must continue to work
- Chatbot UI display with message bubbles, timestamps, and loading indicators must remain unchanged
- System data fetching from EmissionsService must continue to work
- All other API endpoints (emissions, gas sensors, alerts, etc.) must be completely unaffected

**Scope:**
All inputs that do NOT involve the bedrock-chatbot endpoint should be completely unaffected by this fix. This includes:
- Other API Gateway endpoints and their CORS configurations
- Mouse clicks and UI interactions in the chatbot component
- System data refresh intervals and polling logic
- Other Lambda functions and their response formats

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Missing OPTIONS Method in API Gateway**: The API Gateway resource for `/bedrock-chatbot` either doesn't have an OPTIONS method configured, or the OPTIONS method exists but doesn't return the required CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`)

2. **Incorrect Endpoint URL Configuration**: The `API_CONFIG.BASE_URL` in `src/config/api.ts` is set to a placeholder value, and BedrockChatbotService uses this to construct the endpoint URL. The actual endpoint should be `https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com/prod/bedrock-chatbot` but the code may be missing the `/prod` stage prefix

3. **Response Format Mismatch**: The Lambda function returns `{ message: string, voiceUrl?: string, analysis?: any }` but the frontend expects `{ textResponse: string, audioUrl?: string, analysis: ChatbotAnalysis }`. The BedrockChatbotService also tries to parse `data.body` which doesn't exist in the Lambda response

4. **Inconsistent Endpoint Usage**: SystemChatbot.tsx uses `import.meta.env.VITE_API_URL` directly while BedrockChatbotService uses `API_CONFIG.BASE_URL`, leading to potential inconsistencies in endpoint configuration

## Correctness Properties

Property 1: Fault Condition - CORS Preflight Success and Correct Response Format

_For any_ chatbot message request where the browser sends a preflight OPTIONS request to the bedrock-chatbot endpoint, the API Gateway SHALL return a 200 response with proper CORS headers (`Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: GET,POST,OPTIONS`, `Access-Control-Allow-Headers: Content-Type,Authorization`), and when the subsequent POST request succeeds, the Lambda function SHALL return a response in the format `{ textResponse: string, audioUrl?: string, analysis: ChatbotAnalysis }` that the frontend can successfully parse.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Non-Chatbot Functionality

_For any_ API request that is NOT to the bedrock-chatbot endpoint (emissions data, gas sensors, alerts, waste bins, etc.), the system SHALL produce exactly the same behavior as before the fix, preserving all existing API functionality, CORS configurations, and response formats for other endpoints.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File 1**: API Gateway Configuration (via AWS CLI script)

**Script**: `fix-cors-api-gateway.sh` (already exists, needs to be executed)

**Specific Changes**:
1. **Create OPTIONS Method**: Add an OPTIONS method to the `/bedrock-chatbot` resource with authorization type NONE
2. **Configure Mock Integration**: Set up a MOCK integration for the OPTIONS method (no Lambda invocation needed)
3. **Add Method Response**: Configure the OPTIONS method response with status 200 and CORS header parameters
4. **Add Integration Response**: Configure the integration response to return the actual CORS header values:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
   - `Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
5. **Update POST Method Response**: Ensure the POST method response includes `Access-Control-Allow-Origin` header parameter
6. **Deploy Changes**: Create a new deployment to the `prod` stage to activate the changes

**File 2**: `src/lambda/bedrock-chatbot/index.ts`

**Function**: `handler`

**Specific Changes**:
1. **Update Response Format**: Change the response object from `{ message, voiceUrl, analysis }` to `{ textResponse, audioUrl, analysis }` to match frontend expectations
   - Rename `message` property to `textResponse`
   - Rename `voiceUrl` property to `audioUrl`
2. **Ensure CORS Headers**: Verify that `corsHeaders` are included in all response paths (already implemented correctly)
3. **Update TypeScript Interface**: Change the `ChatbotResponse` interface to match the new format

**File 3**: `src/services/BedrockChatbotService.ts`

**Function**: `sendMessage`

**Specific Changes**:
1. **Remove data.body Parsing**: Change `const result = JSON.parse(data.body || data);` to `const result = data;` since the Lambda response is already a JSON object, not a stringified body
2. **Verify Response Property Access**: Ensure the code accesses `result.textResponse` and `result.audioUrl` which will now match the Lambda response format

**File 4**: `src/config/api.ts`

**Configuration**: `API_CONFIG.BASE_URL`

**Specific Changes**:
1. **Update Default BASE_URL**: Change the default value from `'https://your-api-gateway-url.execute-api.ap-south-1.amazonaws.com/prod'` to `'https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com/prod'` to ensure the correct API Gateway URL is used when VITE_API_URL is not set

**File 5**: `src/components/SystemChatbot.tsx`

**Function**: `handleSendMessage`

**Specific Changes**:
1. **Update Response Property Access**: Change `data.message` to `data.textResponse` to match the new Lambda response format (line 86)
2. **Consider Using API_CONFIG**: Optionally refactor to use `API_CONFIG.BASE_URL` instead of directly accessing `import.meta.env.VITE_API_URL` for consistency with BedrockChatbotService

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (CORS failures, wrong endpoint errors, response parsing errors), then verify the fix works correctly and preserves existing behavior.

### Exploratory Fault Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate chatbot message sending and inspect the network requests, CORS headers, and response formats. Run these tests on the UNFIXED code to observe failures and understand the root cause.

**Test Cases**:
1. **CORS Preflight Test**: Send a chatbot message and capture the OPTIONS request → Verify it fails with missing CORS headers (will fail on unfixed code)
2. **Endpoint URL Test**: Inspect the actual URL being called by BedrockChatbotService → Verify it's missing `/prod` prefix or using wrong base URL (will fail on unfixed code)
3. **Response Format Test**: Mock a Lambda response with `{ message: "test" }` and verify frontend parsing fails when accessing `textResponse` (will fail on unfixed code)
4. **Integration Test**: Send actual chatbot message through UI → Verify complete failure with "Failed to fetch" error (will fail on unfixed code)

**Expected Counterexamples**:
- OPTIONS request returns 403 Forbidden or 200 without `Access-Control-Allow-Origin` header
- POST request goes to `https://jbljrvuy95.execute-api.ap-south-1.amazonaws.com/bedrock-chatbot` instead of `.../prod/bedrock-chatbot`
- Frontend code tries to access `result.textResponse` but gets undefined because Lambda returns `result.message`
- Possible causes: API Gateway OPTIONS method not configured, incorrect BASE_URL, response property name mismatch

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := handleChatbotRequest_fixed(input)
  ASSERT expectedBehavior(result)
END FOR
```

**Expected Behavior After Fix:**
- OPTIONS requests return 200 with all required CORS headers
- POST requests use correct endpoint URL with `/prod` prefix
- Lambda responses use `textResponse` and `audioUrl` properties
- Frontend successfully parses and displays chatbot responses

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalBehavior(input) = fixedBehavior(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-chatbot endpoints and chatbot internal logic, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Other API Endpoints Preservation**: Verify that emissions, gas sensors, alerts, and other API calls continue to work exactly as before the fix
2. **Claude Model Invocation Preservation**: Verify that the Bedrock Claude 3 Haiku model is still invoked with the same parameters and system prompt
3. **Conversation History Preservation**: Verify that conversation history management (adding messages, limiting to 10 messages) works identically
4. **UI Display Preservation**: Verify that message bubbles, timestamps, loading indicators, and other UI elements display correctly

### Unit Tests

- Test OPTIONS request handling in API Gateway (mock AWS CLI responses)
- Test Lambda response format with correct property names (`textResponse`, `audioUrl`)
- Test BedrockChatbotService response parsing without `data.body` access
- Test SystemChatbot response property access with `data.textResponse`
- Test endpoint URL construction with correct `/prod` prefix
- Test error handling when chatbot request fails

### Property-Based Tests

- Generate random chatbot messages and verify they all receive proper CORS headers in OPTIONS responses
- Generate random system data payloads and verify Lambda processes them correctly with new response format
- Generate random conversation histories and verify preservation of history management logic
- Test that all non-chatbot API endpoints continue to work across many random request scenarios

### Integration Tests

- Test full chatbot flow: user types message → OPTIONS preflight succeeds → POST request sent to correct endpoint → Lambda processes request → Frontend displays response
- Test chatbot with various system data states (null, empty, full data)
- Test chatbot error scenarios (network failure, Lambda error) and verify error messages display correctly
- Test that other features (emissions dashboard, alerts, waste bins) continue to work while chatbot is fixed
