#!/bin/bash

# CORS Fix for Bedrock Chatbot API Gateway
# This script properly configures CORS on the API Gateway using AWS CLI

set -e

# Configuration
API_ID="5rniegnroc"  # The API ID from the endpoint
REGION="ap-south-1"
STAGE="prod"
RESOURCE_PATH="/bedrock-chatbot"

echo "=========================================="
echo "Fixing CORS for Bedrock Chatbot API"
echo "=========================================="
echo "API ID: $API_ID"
echo "Region: $REGION"
echo "Stage: $STAGE"
echo "Resource Path: $RESOURCE_PATH"
echo ""

# Step 1: Get the resource ID for /bedrock-chatbot
echo "Step 1: Finding resource ID for $RESOURCE_PATH..."
RESOURCE_ID=$(aws apigateway get-resources \
  --rest-api-id "$API_ID" \
  --region "$REGION" \
  --query "items[?path=='$RESOURCE_PATH'].id" \
  --output text)

if [ -z "$RESOURCE_ID" ]; then
  echo "ERROR: Could not find resource with path $RESOURCE_PATH"
  exit 1
fi

echo "Found resource ID: $RESOURCE_ID"
echo ""

# Step 2: Delete existing OPTIONS method if it exists
echo "Step 2: Checking for existing OPTIONS method..."
if aws apigateway get-method \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS \
  --region "$REGION" 2>/dev/null; then
  echo "Deleting existing OPTIONS method..."
  aws apigateway delete-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --region "$REGION"
  echo "OPTIONS method deleted"
else
  echo "No existing OPTIONS method found"
fi
echo ""

# Step 3: Create OPTIONS method
echo "Step 3: Creating OPTIONS method..."
aws apigateway put-method \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS \
  --authorization-type NONE \
  --region "$REGION"
echo "OPTIONS method created"
echo ""

# Step 4: Create mock integration for OPTIONS
echo "Step 4: Creating mock integration for OPTIONS..."
aws apigateway put-integration \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS \
  --type MOCK \
  --region "$REGION"
echo "Mock integration created"
echo ""

# Step 5: Add method response for OPTIONS
echo "Step 5: Adding method response for OPTIONS..."
aws apigateway put-method-response \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS \
  --status-code 200 \
  --response-models '{"application/json":"Empty"}' \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Allow-Origin":false}' \
  --region "$REGION"
echo "Method response added"
echo ""

# Step 6: Add integration response for OPTIONS
echo "Step 6: Adding integration response for OPTIONS..."
aws apigateway put-integration-response \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method OPTIONS \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,POST,PUT,DELETE,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
  --region "$REGION"
echo "Integration response added"
echo ""

# Step 7: Update POST method response headers
echo "Step 7: Updating POST method response headers..."
# First, check if the response exists and delete it if needed
if aws apigateway get-method-response \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --status-code 200 \
  --region "$REGION" 2>/dev/null; then
  echo "Deleting existing POST method response..."
  aws apigateway delete-method-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method POST \
    --status-code 200 \
    --region "$REGION"
fi

# Now create the updated response
aws apigateway put-method-response \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":false}' \
  --region "$REGION"
echo "POST method response updated"
echo ""

# Step 8: Update POST integration response
echo "Step 8: Updating POST integration response..."
# First, check if the integration response exists and delete it if needed
if aws apigateway get-integration-response \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --status-code 200 \
  --region "$REGION" 2>/dev/null; then
  echo "Deleting existing POST integration response..."
  aws apigateway delete-integration-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method POST \
    --status-code 200 \
    --region "$REGION"
fi

# Now create the updated integration response
aws apigateway put-integration-response \
  --rest-api-id "$API_ID" \
  --resource-id "$RESOURCE_ID" \
  --http-method POST \
  --status-code 200 \
  --response-parameters '{"method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
  --region "$REGION"
echo "POST integration response updated"
echo ""

# Step 9: Deploy to stage
echo "Step 9: Deploying to $STAGE stage..."
DEPLOYMENT_ID=$(aws apigateway create-deployment \
  --rest-api-id "$API_ID" \
  --stage-name "$STAGE" \
  --region "$REGION" \
  --query 'id' \
  --output text)
echo "Deployment created: $DEPLOYMENT_ID"
echo ""

echo "=========================================="
echo "CORS Configuration Complete!"
echo "=========================================="
echo "API Endpoint: https://$API_ID.execute-api.$REGION.amazonaws.com/$STAGE$RESOURCE_PATH"
echo ""
echo "Next steps:"
echo "1. Test the chatbot in your frontend"
echo "2. Check browser console for any remaining errors"
echo "3. If issues persist, check CloudWatch logs for the Lambda function"
echo ""
