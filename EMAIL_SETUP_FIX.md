# Email Not Sending - Fix Guide

## Problem Found! 🔍

Your infrastructure code shows:

```typescript
magicLink: {
    emailFromAddress: "noreply@em5604.makeinvoices.app",
    sendgridApiKey: "",  // ← EMPTY! This is why emails aren't sending
    autoConfirmUsers: true,
},
```

The `sendgridApiKey` is empty, so the Lambda function can't send emails.

---

## Solution Options

### Option 1: Use SendGrid (Current Setup)

SendGrid is a third-party email service. It's easier to set up than AWS SES.

**Steps:**

1. **Create SendGrid Account**
    - Go to https://sendgrid.com/
    - Sign up for free account (100 emails/day free)

2. **Create API Key**
    - Login to SendGrid
    - Go to Settings → API Keys
    - Click "Create API Key"
    - Name it "SIS Magic Links"
    - Select "Full Access" or "Mail Send" permission
    - Copy the API key (starts with `SG.`)

3. **Verify Sender Email**
    - Go to Settings → Sender Authentication
    - Click "Verify a Single Sender"
    - Enter: noreply@em5604.makeinvoices.app
    - Check your email and verify

4. **Update Infrastructure Code**

    Edit `infra/stacks/invoice-service-stack.ts`:

    ```typescript
    this.auth = new Passwordless(this, "Auth", {
        allowedOrigins: allowedOrigins,
        magicLink: {
            emailFromAddress: "noreply@em5604.makeinvoices.app",
            sendgridApiKey: "SG.your_actual_api_key_here", // ← ADD YOUR KEY
            autoConfirmUsers: true,
        },
        logLevel: environment === "dev" ? "DEBUG" : "INFO",
    });
    ```

5. **Deploy**

    ```bash
    cd infra
    npm run deploy
    ```

**Pros:**

- ✅ Easy setup (5 minutes)
- ✅ Free tier (100 emails/day)
- ✅ Better deliverability than SES sandbox
- ✅ No AWS SES verification needed

**Cons:**

- ❌ Third-party dependency
- ❌ API key in code (use AWS Secrets Manager in production)

---

### Option 2: Switch to AWS SES

Use AWS's native email service instead of SendGrid.

**Steps:**

1. **Verify Email in SES**

    ```bash
    aws ses verify-email-identity \
      --email-address noreply@em5604.makeinvoices.app \
      --region eu-west-1
    ```

    Check your email and click verification link.

2. **Update Infrastructure Code**

    You'll need to modify the Passwordless construct to use SES instead of SendGrid. Check the construct code:

    ```bash
    cat infra/stacks/constructs/cognito-paswordless/cognito-paswordless.ts
    ```

    Look for how it handles `sendgridApiKey`. You may need to:
    - Remove `sendgridApiKey` parameter
    - Add SES configuration
    - Update Lambda function to use AWS SDK SES instead of SendGrid

3. **Grant Lambda SES Permissions**

    The Lambda function needs IAM permissions:

    ```typescript
    // In your stack, after creating the Passwordless construct:
    this.auth.lambdaFunction.addToRolePolicy(
        new iam.PolicyStatement({
            actions: ["ses:SendEmail", "ses:SendRawEmail"],
            resources: ["*"],
        }),
    );
    ```

4. **Request Production Access** (Optional but recommended)

    SES starts in sandbox mode (can only send to verified emails).

    ```bash
    # Request production access
    aws sesv2 put-account-details \
      --production-access-enabled \
      --mail-type TRANSACTIONAL \
      --website-url https://makeinvoices.app \
      --use-case-description "Sending magic link authentication emails for invoice app" \
      --region eu-west-1
    ```

    AWS reviews in 24-48 hours.

**Pros:**

- ✅ Native AWS service
- ✅ No third-party dependency
- ✅ Better for production

**Cons:**

- ❌ More complex setup
- ❌ Sandbox mode restrictions initially
- ❌ May require code changes to Passwordless construct

---

## Recommended: Option 1 (SendGrid)

For quick testing and development, use SendGrid:

1. Get SendGrid API key (5 minutes)
2. Update `sendgridApiKey` in code
3. Deploy
4. Test immediately

You can switch to SES later for production.

---

## After Fixing

Once you've added the SendGrid API key and deployed:

1. **Test the flow:**

    ```bash
    # Start dev server
    cd frontend
    npm run dev
    ```

2. **Open http://localhost:5173/login**

3. **Enter your email** (any email, doesn't need to be verified)

4. **Click "Log in with Email"**

5. **Check your email** (including spam folder)

6. **Click the magic link**

7. **Should redirect to /workspace** ✅

---

## Debugging After Fix

If emails still don't send:

1. **Check CloudWatch Logs:**

    ```bash
    # Find the Lambda function
    aws lambda list-functions --region eu-west-1 | grep -i "define\|create\|verify"

    # View logs
    aws logs tail /aws/lambda/FUNCTION_NAME --follow --region eu-west-1
    ```

2. **Look for errors:**
    - "SendGrid API error"
    - "Invalid API key"
    - "Sender not verified"

3. **Enable debug logging:**

    The stack already has `logLevel: "DEBUG"` in dev, so logs should be verbose.

---

## Security Note

**Don't commit API keys to git!**

Better approach for production:

```typescript
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";

// Create secret
const sendgridSecret = secretsmanager.Secret.fromSecretNameV2(
    this,
    "SendGridSecret",
    "sendgrid-api-key",
);

// Pass to Lambda as environment variable
this.auth = new Passwordless(this, "Auth", {
    // ... other config
    magicLink: {
        emailFromAddress: "noreply@em5604.makeinvoices.app",
        sendgridApiKeySecretArn: sendgridSecret.secretArn, // Use secret ARN
        autoConfirmUsers: true,
    },
});
```

Then store the actual key in AWS Secrets Manager:

```bash
aws secretsmanager create-secret \
    --name sendgrid-api-key \
    --secret-string "SG.your_actual_key" \
    --region eu-west-1
```

---

## Quick Start Command

```bash
# 1. Get SendGrid API key from https://app.sendgrid.com/settings/api_keys

# 2. Update the code
# Edit: infra/stacks/invoice-service-stack.ts
# Line 107: sendgridApiKey: "SG.your_key_here",

# 3. Deploy
cd infra
npm run deploy

# 4. Test
cd ../frontend
npm run dev
# Open http://localhost:5173/login
```

That's it! 🚀
