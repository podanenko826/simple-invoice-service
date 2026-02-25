# Configuration Setup Guide

This guide explains how to configure the application for development and production environments.

## Overview

The application uses different configuration methods based on the environment:

- **Development**: Uses environment variables from `.env` file
- **Production**: Fetches configuration from `/config.json` at runtime

## Development Setup

### Step 1: Deploy Infrastructure (if not already done)

```bash
cd infra
npm install
npx cdk deploy
```

### Step 2: Get AWS Values

After deployment, note the CloudFormation outputs:

```
Outputs:
InvoiceServiceStack.UserPoolId = eu-west-1_XXXXXXXXX
InvoiceServiceStack.UserPoolClientId = 1a2b3c4d5e6f7g8h9i0j
InvoiceServiceStack.ApiUrl = https://abc123xyz.execute-api.eu-west-1.amazonaws.com/prod/
```

Or get them from AWS Console:

1. Go to [AWS CloudFormation Console](https://console.aws.amazon.com/cloudformation)
2. Select your stack (e.g., `InvoiceServiceStack`)
3. Click the "Outputs" tab

### Step 3: Create .env File

```bash
cd frontend
cp .env.example .env
```

Edit `.env` with your actual AWS values:

```env
VITE_USER_POOL_ID=eu-west-1_XXXXXXXXX
VITE_USER_POOL_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
VITE_API_URL=https://abc123xyz.execute-api.eu-west-1.amazonaws.com/prod/
VITE_REGION=eu-west-1
```

### Step 4: Start Development Server

```bash
npm run dev
```

The app will automatically load configuration from environment variables.

## Production Setup

### Option 1: Automatic (Using Script)

```bash
# From the simple-invoice-hub directory
./scripts/generate-config.sh

# Or specify custom stack name and region
./scripts/generate-config.sh MyStackName us-east-1
```

This creates `frontend/public/config.json` automatically.

### Option 2: Manual

Create `frontend/public/config.json`:

```json
{
    "userPoolId": "eu-west-1_XXXXXXXXX",
    "userPoolClientId": "1a2b3c4d5e6f7g8h9i0j",
    "apiUrl": "https://abc123xyz.execute-api.eu-west-1.amazonaws.com/prod/",
    "region": "eu-west-1"
}
```

### Build for Production

```bash
cd frontend
npm run build
```

The built application will fetch configuration from `/config.json` at runtime.

## Environment Detection

The application automatically detects the environment:

- **Development** (`npm run dev`): Uses `import.meta.env.DEV = true` → Loads from `.env`
- **Production** (`npm run build`): Uses `import.meta.env.DEV = false` → Fetches `/config.json`

## Verification

### Development

```bash
# Check if env vars are loaded
npm run dev
# Open browser console and check for: "Loading config from environment variables"
```

### Production

```bash
# Build and preview
npm run build
npm run preview
# Open browser console and check for: "Loading config from /config.json"
```

## Troubleshooting

### Development Issues

**Missing environment variables error:**

- Ensure `.env` file exists in `frontend/` directory
- Check all required `VITE_*` variables are set
- Restart dev server after creating/modifying `.env`

**Values not updating:**

- Restart the dev server (`npm run dev`)
- Clear browser cache
- Check for typos in variable names (must start with `VITE_`)

### Production Issues

**Config file not found (404):**

- Ensure `config.json` is in `frontend/public/` directory
- Verify it's included in the build output (`dist/config.json`)

**CORS errors:**

- Check that your frontend URL is in `allowedOrigins` in the CDK stack
- Verify API Gateway CORS configuration

## Security Best Practices

### Development

- ✅ `.env` is in `.gitignore` (never commit it)
- ✅ Use `.env.example` as a template
- ✅ Each developer has their own `.env` file

### Production

- ✅ `config.json` is in `.gitignore`
- ✅ Generate `config.json` during deployment
- ✅ Use different configs for different environments (dev, staging, prod)
- ✅ Consider using AWS Secrets Manager for sensitive values

## Docker Build

For Docker builds, the application runs in production mode:

```dockerfile
# In your Dockerfile
COPY frontend/public/config.json /app/public/config.json
```

Or generate it during container startup:

```dockerfile
CMD ["sh", "-c", "./scripts/generate-config.sh && npm start"]
```

## AWS CLI Commands

Get values programmatically:

```bash
# Get User Pool ID
aws cloudformation describe-stacks \
  --stack-name InvoiceServiceStack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolId`].OutputValue' \
  --output text

# Get User Pool Client ID
aws cloudformation describe-stacks \
  --stack-name InvoiceServiceStack \
  --query 'Stacks[0].Outputs[?OutputKey==`UserPoolClientId`].OutputValue' \
  --output text

# Get API URL
aws cloudformation describe-stacks \
  --stack-name InvoiceServiceStack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiUrl`].OutputValue' \
  --output text
```
