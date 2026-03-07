#!/bin/bash

# AI Climate Control Dashboard - AWS Amplify Deployment Script
# This script helps deploy the dashboard to AWS Amplify

set -e

echo "=========================================="
echo "AI Climate Control - Amplify Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}Error: AWS CLI is not installed${NC}"
    echo "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null; then
    echo -e "${YELLOW}Amplify CLI not found. Installing...${NC}"
    npm install -g @aws-amplify/cli
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Get API Gateway URL
echo "Please enter your API Gateway URL:"
echo "Example: https://abc123.execute-api.ap-south-1.amazonaws.com/prod"
read -p "API URL: " API_URL

if [ -z "$API_URL" ]; then
    echo -e "${RED}Error: API URL is required${NC}"
    exit 1
fi

# Create .env file
echo "Creating .env file..."
cat > .env << EOF
VITE_API_URL=$API_URL
EOF

echo -e "${GREEN}✓ Environment file created${NC}"
echo ""

# Test build
echo "Testing build..."
npm install
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

echo ""
echo "=========================================="
echo "Choose deployment method:"
echo "=========================================="
echo "1. Deploy via Amplify Console (Recommended)"
echo "2. Deploy via Amplify CLI"
echo "3. Exit"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "=========================================="
        echo "Amplify Console Deployment"
        echo "=========================================="
        echo ""
        echo "Follow these steps:"
        echo ""
        echo "1. Push your code to Git:"
        echo "   git add ."
        echo "   git commit -m 'Ready for Amplify deployment'"
        echo "   git push origin main"
        echo ""
        echo "2. Open AWS Amplify Console:"
        echo "   https://console.aws.amazon.com/amplify/"
        echo ""
        echo "3. Click 'New app' → 'Host web app'"
        echo ""
        echo "4. Connect your Git repository"
        echo ""
        echo "5. Add environment variable:"
        echo "   Key: VITE_API_URL"
        echo "   Value: $API_URL"
        echo ""
        echo "6. Deploy!"
        echo ""
        echo "Your dashboard will be live in 5-10 minutes"
        ;;
    2)
        echo ""
        echo "=========================================="
        echo "Amplify CLI Deployment"
        echo "=========================================="
        echo ""
        
        # Initialize Amplify
        echo "Initializing Amplify..."
        amplify init --yes
        
        # Add hosting
        echo "Adding hosting..."
        amplify add hosting
        
        # Set environment variable
        echo "Setting environment variable..."
        amplify env add production
        
        # Publish
        echo "Publishing to Amplify..."
        amplify publish
        
        echo ""
        echo -e "${GREEN}✓ Deployment complete!${NC}"
        echo ""
        echo "Your dashboard is now live!"
        ;;
    3)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Access your dashboard URL"
echo "2. Test all features"
echo "3. Configure custom domain (optional)"
echo "4. Set up monitoring"
echo ""
echo "For detailed instructions, see:"
echo "AWS_AMPLIFY_DEPLOYMENT_GUIDE.md"
echo ""
