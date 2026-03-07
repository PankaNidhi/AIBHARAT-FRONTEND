# CORS Fix for Bedrock Chatbot API Gateway
# This script properly configures CORS on the API Gateway using AWS CLI

$ErrorActionPreference = "Stop"

# Configuration
$API_ID = "jbljrvuy95"  # The API ID from the endpoint
$REGION = "ap-south-1"
$STAGE = "prod"
$RESOURCE_PATH = "/bedrock-chatbot"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Fixing CORS for Bedrock Chatbot API" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "API ID: $API_ID"
Write-Host "Region: $REGION"
Write-Host "Stage: $STAGE"
Write-Host "Resource Path: $RESOURCE_PATH"
Write-Host ""

# Step 1: Get the resource ID for /bedrock-chatbot
Write-Host "Step 1: Finding resource ID for $RESOURCE_PATH..." -ForegroundColor Yellow
$resourceOutput = aws apigateway get-resources `
  --rest-api-id $API_ID `
  --region $REGION `
  --query "items[?path=='$RESOURCE_PATH'].id" `
  --output text

$RESOURCE_ID = $resourceOutput.Trim()

if ([string]::IsNullOrEmpty($RESOURCE_ID)) {
  Write-Host "ERROR: Could not find resource with path $RESOURCE_PATH" -ForegroundColor Red
  exit 1
}

Write-Host "Found resource ID: $RESOURCE_ID" -ForegroundColor Green
Write-Host ""

# Step 2: Delete existing OPTIONS method if it exists
Write-Host "Step 2: Checking for existing OPTIONS method..." -ForegroundColor Yellow
try {
  aws apigateway get-method `
    --rest-api-id $API_ID `
    --resource-id $RESOURCE_ID `
    --http-method OPTIONS `
    --region $REGION 2>$null
  
  Write-Host "Deleting existing OPTIONS method..." -ForegroundColor Yellow
  aws apigateway delete-method `
    --rest-api-id $API_ID `
    --resource-id $RESOURCE_ID `
    --http-method OPTIONS `
    --region $REGION
  Write-Host "OPTIONS method deleted" -ForegroundColor Green
} catch {
  Write-Host "No existing OPTIONS method found" -ForegroundColor Green
}
Write-Host ""

# Step 3: Create OPTIONS method
Write-Host "Step 3: Creating OPTIONS method..." -ForegroundColor Yellow
aws apigateway put-method `
  --rest-api-id $API_ID `
  --resource-id $RESOURCE_ID `
  --http-method OPTIONS `
  --authorization-type NONE `
  --region $REGION
Write-Host "OPTIONS method created" -ForegroundColor Green
Write-Host ""

# Step 4: Create mock integration for OPTIONS
Write-Host "Step 4: Creating mock integration for OPTIONS..." -ForegroundColor Yellow
aws apigateway put-integration `
  --rest-api-id $API_ID `
  --resource-id $RESOURCE_ID `
  --http-method OPTIONS `
  --type MOCK `
  --region $REGION
Write-Host "Mock integration created" -ForegroundColor Green
Write-Host ""

# Step 5: Add method response for OPTIONS
Write-Host "Step 5: Adding method response for OPTIONS..." -ForegroundColor Yellow
aws apigateway put-method-response `
  --rest-api-id $API_ID `
  --resource-id $RESOURCE_ID `
  --http-method OPTIONS `
  --status-code 200 `
  --response-models '{"application/json":"Empty"}' `
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Allow-Origin":false}' `
  --region $REGION
Write-Host "Method response added" -ForegroundColor Green
Write-Host ""

# Step 6: Add integration response for OPTIONS
Write-Host "Step 6: Adding integration response for OPTIONS..." -ForegroundColor Yellow
aws apigateway put-integration-response `
  --rest-api-id $API_ID `
  --resource-id $RESOURCE_ID `
  --http-method OPTIONS `
  --status-code 200 `
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token","method.response.header.Access-Control-Allow-Methods":"GET,POST,PUT,DELETE,OPTIONS","method.response.header.Access-Control-Allow-Origin":"*"}' `
  --region $REGION
Write-Host "Integration response added" -ForegroundColor Green
Write-Host ""

# Step 7: Update POST method response headers
Write-Host "Step 7: Updating POST method response headers..." -ForegroundColor Yellow
aws apigateway put-method-response `
  --rest-api-id $API_ID `
  --resource-id $RESOURCE_ID `
  --http-method POST `
  --status-code 200 `
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":false}' `
  --region $REGION
Write-Host "POST method response updated" -ForegroundColor Green
Write-Host ""

# Step 8: Update POST integration response
Write-Host "Step 8: Updating POST integration response..." -ForegroundColor Yellow
aws apigateway put-integration-response `
  --rest-api-id $API_ID `
  --resource-id $RESOURCE_ID `
  --http-method POST `
  --status-code 200 `
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"*"}' `
  --region $REGION
Write-Host "POST integration response updated" -ForegroundColor Green
Write-Host ""

# Step 9: Deploy to stage
Write-Host "Step 9: Deploying to $STAGE stage..." -ForegroundColor Yellow
$deploymentOutput = aws apigateway create-deployment `
  --rest-api-id $API_ID `
  --stage-name $STAGE `
  --region $REGION `
  --query 'id' `
  --output text

$DEPLOYMENT_ID = $deploymentOutput.Trim()
Write-Host "Deployment created: $DEPLOYMENT_ID" -ForegroundColor Green
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CORS Configuration Complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "API Endpoint: https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE$RESOURCE_PATH"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Test the chatbot in your frontend"
Write-Host "2. Check browser console for any remaining errors"
Write-Host "3. If issues persist, check CloudWatch logs for the Lambda function"
Write-Host ""
