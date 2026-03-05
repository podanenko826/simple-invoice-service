#!/bin/bash

# Frontend-only deployment script for Simple Invoice Service
# This script builds the frontend and deploys it to S3 + invalidates CloudFront cache
# Usage: ./deploy-frontend.sh [--profile <aws-profile>] [--stack <stack-name>]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
AWS_PROFILE=""
STACK_NAME="InvoiceServiceStack"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --profile)
            AWS_PROFILE="$2"
            shift 2
            ;;
        --stack)
            STACK_NAME="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Usage: $0 [--profile <aws-profile>] [--stack <stack-name>]"
            exit 1
            ;;
    esac
done

# Set AWS profile if provided
if [ -n "$AWS_PROFILE" ]; then
    export AWS_PROFILE
    echo -e "${GREEN}Using AWS profile: ${AWS_PROFILE}${NC}"
fi

echo -e "${GREEN}=== Frontend Deployment Script ===${NC}"
echo ""

# Check for uncommitted infrastructure changes
echo -e "${YELLOW}Checking for infrastructure changes...${NC}"
cd ..
if git diff --quiet HEAD -- infra/ && git diff --cached --quiet HEAD -- infra/; then
    echo -e "${GREEN}✓ No infrastructure changes detected${NC}"
else
    echo -e "${RED}Error: Uncommitted changes detected in infrastructure!${NC}"
    echo -e "${YELLOW}Changed files:${NC}"
    git diff --name-only HEAD -- infra/
    git diff --cached --name-only HEAD -- infra/
    echo ""
    echo -e "${RED}This script is for frontend-only deployments.${NC}"
    echo -e "${YELLOW}For infrastructure changes, use: cd infra && cdk deploy${NC}"
    exit 1
fi
cd scripts
echo ""

# Step 0: List available stacks if default stack not found
echo -e "${YELLOW}Checking for CloudFormation stack: ${STACK_NAME}${NC}"
if ! aws cloudformation describe-stacks --stack-name "$STACK_NAME" &>/dev/null; then
    echo -e "${YELLOW}Stack '${STACK_NAME}' not found. Available stacks:${NC}"
    aws cloudformation list-stacks \
        --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE \
        --query "StackSummaries[].StackName" \
        --output table
    echo ""
    echo -e "${RED}Please specify the correct stack name using --stack option${NC}"
    echo "Example: $0 --profile ${AWS_PROFILE} --stack YourStackName"
    exit 1
fi

echo -e "${GREEN}✓ Found stack: ${STACK_NAME}${NC}"
echo ""

# Step 1: Get CloudFormation stack outputs
echo -e "${YELLOW}Step 1: Fetching CloudFormation stack outputs...${NC}"

# Get S3 bucket name (handle CDK-generated suffix)
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?contains(OutputKey,'WebsiteBucketName')].OutputValue" \
    --output text)

# Get CloudFront distribution ID (handle CDK-generated suffix)
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?contains(OutputKey,'DistributionId')].OutputValue" \
    --output text)

if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
    echo -e "${RED}Error: Could not retrieve stack outputs.${NC}"
    echo -e "${YELLOW}Available outputs for stack '${STACK_NAME}':${NC}"
    aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query "Stacks[0].Outputs[].[OutputKey,OutputValue]" \
        --output table
    exit 1
fi

echo -e "${GREEN}✓ S3 Bucket: ${BUCKET_NAME}${NC}"
echo -e "${GREEN}✓ CloudFront Distribution: ${DISTRIBUTION_ID}${NC}"
echo ""

# Step 2: Build frontend
echo -e "${YELLOW}Step 2: Building frontend...${NC}"
cd ../frontend
npm run build
cd ../scripts
echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# Step 3: Sync to S3
echo -e "${YELLOW}Step 3: Uploading to S3...${NC}"
aws s3 sync ../frontend/dist/ "s3://${BUCKET_NAME}/" \
    --delete \
    --cache-control "public, max-age=31536000, immutable" \
    --exclude "index.html" \
    --exclude "config.json"

# Upload index.html with no-cache (always check for updates)
aws s3 cp ../frontend/dist/index.html "s3://${BUCKET_NAME}/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

echo -e "${GREEN}✓ Files uploaded to S3${NC}"
echo ""

# Step 4: Invalidate CloudFront cache
echo -e "${YELLOW}Step 4: Invalidating CloudFront cache...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text)

echo -e "${GREEN}✓ CloudFront invalidation created: ${INVALIDATION_ID}${NC}"
echo ""

# Step 5: Wait for invalidation (optional)
echo -e "${YELLOW}Step 5: Waiting for invalidation to complete...${NC}"
echo -e "${YELLOW}(This may take 1-3 minutes)${NC}"

aws cloudfront wait invalidation-completed \
    --distribution-id "$DISTRIBUTION_ID" \
    --id "$INVALIDATION_ID"

echo -e "${GREEN}✓ CloudFront cache invalidated${NC}"
echo ""

# Get website URL (handle CDK-generated suffix)
WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --query "Stacks[0].Outputs[?contains(OutputKey,'WebsiteUrl')].OutputValue" \
    --output text)

echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo -e "${GREEN}Website URL: ${WEBSITE_URL}${NC}"
echo ""
echo -e "${YELLOW}Note: It may take a few minutes for changes to propagate globally.${NC}"
