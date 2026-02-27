# Authentication Flow Explained

## How Magic Link Authentication Works

Your app uses **passwordless authentication** with AWS Cognito. Here's the complete flow:

### 1. Configuration (Happens on App Load)

```
main.tsx loads → runtime-config.ts fetches config → Passwordless.configure() is called
```

The app loads configuration from:

- **Development**: `.env` file (VITE\_\* variables)
- **Production**: `/public/config.json` file

Configuration includes:

- `userPoolId`: eu-west-1_3DAfzFg4A
- `userPoolClientId`: 3frk8crgtpd1bcdiig76ggea87
- `region`: eu-west-1

### 2. User Requests Magic Link

When user enters email and clicks "Log in with Email":

```
Login.tsx → handleRequestLink() → requestSignInLink() → AWS Cognito
```

**What happens:**

1. `requestSignInLink()` calls AWS Cognito's `InitiateAuth` API
2. Cognito triggers a **Lambda function** (your custom auth challenge)
3. Lambda generates a magic link and sends email via **Amazon SES**
4. Cognito returns a session ID (stored in localStorage)
5. UI shows "✅ Magic link sent! Check your email"

**Key Point**: The email is sent by **AWS Lambda + SES**, not by your frontend!

### 3. User Clicks Magic Link

The magic link looks like:

```
https://yourapp.com/login#eyJ1c2VyTmFtZSI6InVzZXJAZXhhbXBsZS5jb20iLCJleHAiOjE3MDk...
```

The part after `#` is the authentication token.

### 4. App Processes Magic Link

```
Login.tsx useEffect → signInWithLink() → AWS Cognito → Tokens returned
```

**What happens:**

1. `signInWithLink()` detects the `#` fragment in URL
2. Extracts username and token from the fragment
3. Calls Cognito's `RespondToAuthChallenge` API with the token
4. Cognito validates the token via Lambda
5. Returns JWT tokens (accessToken, idToken, refreshToken)
6. Tokens are stored in localStorage
7. User is redirected to `/workspace`

### 5. Protected Routes

```
User navigates to /workspace → ProtectedRoute checks isAuthenticated → Allow/Deny
```

**What happens:**

1. `ProtectedRoute` component checks `AuthContext`
2. `AuthContext` loads tokens from localStorage
3. Validates tokens aren't expired
4. If valid: show workspace
5. If invalid/missing: redirect to login

### 6. Token Expiration Handling

```
Every 60 seconds → Check token expiry → If expired: signOut() → Redirect to login
```

**What happens:**

1. `AuthContext` runs a timer every 60 seconds
2. Checks if idToken is expired (JWT exp claim)
3. If expired: calls `signOut()` to clear tokens
4. `ProtectedRoute` detects auth change and redirects

---

## Why Emails Aren't Being Sent

Based on your setup, here are the most likely reasons:

### 1. **AWS SES is in Sandbox Mode** ⚠️ MOST LIKELY

In SES sandbox mode, you can ONLY send emails to:

- Verified email addresses
- Verified domains

**Solution:**

1. Go to AWS SES Console
2. Navigate to "Verified identities"
3. Add and verify your email address
4. Check your email for verification link
5. OR request production access (takes 24-48 hours)

**To check if you're in sandbox:**

```bash
aws sesv2 get-account --region eu-west-1
```

Look for `ProductionAccessEnabled: false`

### 2. **Lambda Function Not Configured**

Your Cognito User Pool needs a Lambda trigger for custom auth.

**Check:**

1. Go to Cognito Console → User Pools → eu-west-1_3DAfzFg4A
2. Click "User pool properties" → "Lambda triggers"
3. You should see triggers for:
    - Define auth challenge
    - Create auth challenge
    - Verify auth challenge response

**If missing**, you need to deploy the Lambda functions.

### 3. **Lambda Doesn't Have SES Permissions**

The Lambda function needs IAM permissions to send emails.

**Check Lambda IAM role has:**

```json
{
    "Effect": "Allow",
    "Action": ["ses:SendEmail", "ses:SendRawEmail"],
    "Resource": "*"
}
```

### 4. **Wrong Email Configuration in Lambda**

The Lambda might be configured with wrong sender email.

**Check your Lambda environment variables:**

- `FROM_EMAIL` or similar should be a verified SES email

### 5. **Cognito Client Not Configured for Custom Auth**

**Check:**

1. Cognito Console → App clients → 3frk8crgtpd1bcdiig76ggea87
2. "Authentication flows" should include:
    - ✅ ALLOW_CUSTOM_AUTH
    - ✅ ALLOW_REFRESH_TOKEN_AUTH

---

## Debugging Steps

### Step 1: Check Browser Console

Open DevTools and look for errors when clicking "Log in with Email":

```javascript
// You should see:
"Invoking initiateAuth ...";
"Response from initiateAuth: ...";
"Magic link sent!";

// If you see errors, they'll tell you what's wrong
```

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Click "Log in with Email"
3. Look for requests to Cognito:
    - `cognito-idp.eu-west-1.amazonaws.com`
    - Check response status (should be 200)
    - Check response body for errors

### Step 3: Check CloudWatch Logs

If Lambda is configured:

```bash
# Get Lambda function name
aws lambda list-functions --region eu-west-1 | grep -i auth

# View logs
aws logs tail /aws/lambda/YOUR_FUNCTION_NAME --follow --region eu-west-1
```

Look for:

- "Sending email to..."
- SES errors
- Any exceptions

### Step 4: Test SES Directly

```bash
aws ses send-email \
  --from "your-verified@email.com" \
  --to "your-verified@email.com" \
  --subject "Test" \
  --text "Test email" \
  --region eu-west-1
```

If this fails, SES isn't configured properly.

### Step 5: Enable Debug Logging

Add to `main.tsx`:

```typescript
Passwordless.configure({
    clientId: config.userPoolClientId,
    cognitoIdpEndpoint: config.region,
    userPoolId: config.userPoolId,
    debug: console.debug, // ADD THIS LINE
});
```

This will log all auth operations to console.

---

## Quick Fix Checklist

- [ ] Verify your email in AWS SES Console
- [ ] Check Lambda triggers are attached to Cognito User Pool
- [ ] Verify Lambda has SES send permissions
- [ ] Confirm Cognito app client allows CUSTOM_AUTH
- [ ] Check CloudWatch logs for Lambda errors
- [ ] Enable debug logging in Passwordless.configure()
- [ ] Test SES can send emails directly

---

## Infrastructure Code Location

Your infrastructure is likely in:

- `simple-invoice-hub/infra/stacks/invoice-service-stack.ts`

Check this file for:

- Cognito User Pool configuration
- Lambda function definitions
- SES configuration
- IAM roles and permissions

---

## Common Error Messages

### "User does not exist"

- User needs to be created first
- The code auto-creates users with `signUp()` if they don't exist

### "Invalid session for the user"

- Session expired (15 minutes)
- Request a new magic link

### "Incorrect username or password"

- Magic link expired or already used
- Request a new magic link

### No error, but no email

- **SES sandbox mode** - verify your email!
- Lambda not configured
- Lambda doesn't have SES permissions

---

## Testing the Flow

1. **Verify your email in SES** (most important!)
2. Open browser DevTools console
3. Go to `/login`
4. Enter your verified email
5. Click "Log in with Email"
6. Watch console for logs
7. Check email inbox (and spam folder!)
8. Click magic link
9. Should redirect to `/workspace`

If step 6 shows errors, that's your clue!
