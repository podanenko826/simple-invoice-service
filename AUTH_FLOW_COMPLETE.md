# Complete Magic Link Authentication Flow

This document explains the entire passwordless authentication flow using Cognito Custom Auth with Magic Links.

## Overview

The authentication system uses AWS Cognito with custom Lambda triggers to implement passwordless authentication via magic links sent by email. Users receive a cryptographically signed link that, when clicked, authenticates them without requiring a password.

## Architecture Components

- **AWS Cognito User Pool**: Manages user identities and authentication
- **Lambda Triggers**: Custom authentication logic (6 Lambda functions)
- **Amazon SES**: Sends magic link emails
- **AWS KMS**: Signs magic links cryptographically
- **DynamoDB**: Stores magic link hashes for single-use enforcement and rate limiting
- **Frontend**: Browser-based application that initiates and completes authentication

## Security Features

1. **Cryptographic Signing**: Magic links are signed with AWS KMS (RSA-PSS-SHA-512)
2. **Single-Use Links**: DynamoDB ensures each link can only be used once
3. **Time-Limited**: Links expire after 15 minutes (configurable)
4. **Rate Limiting**: Prevents sending multiple links within 1 minute
5. **Origin Validation**: Only allowed origins can request magic links
6. **Hashed Storage**: Links are stored as SHA-256 hashes in DynamoDB

---

## Complete Authentication Flow

### Phase 1: Initial Session Request

**What happens**: Browser requests a session from Cognito to start authentication.

**Browser → Cognito**:

```javascript
InitiateAuthCommand({
    AuthFlow: "CUSTOM_AUTH",
    ClientId: "your-client-id",
    AuthParameters: {
        USERNAME: "user@example.com",
    },
    ClientMetadata: {
        signInMethod: "MAGIC_LINK",
        redirectUri: "http://localhost:5173/auth-test",
    },
});
```

**Cognito → DefineAuthChallenge Lambda**:

- Cognito calls this Lambda to determine what challenge to issue
- Since `session` is empty (first call), Lambda returns: `issueTokens: false`, `challengeName: "CUSTOM_CHALLENGE"`

**Cognito → CreateAuthChallenge Lambda**:

- Lambda sees empty session and creates a dummy challenge: `PROVIDE_AUTH_PARAMETERS`
- This allows the browser to send another request with metadata

**Cognito → Browser**:

```javascript
{
  ChallengeName: "CUSTOM_CHALLENGE",
  Session: "encrypted-session-token",
  ChallengeParameters: { challenge: "PROVIDE_AUTH_PARAMETERS" }
}
```

**Result**: Browser now has an encrypted session token. No magic link sent yet.

---

### Phase 2: Magic Link Request

**What happens**: Browser sends the session back with metadata to request a magic link.

**Browser → Cognito**:

```javascript
RespondToAuthChallengeCommand({
    ChallengeName: "CUSTOM_CHALLENGE",
    ClientId: "your-client-id",
    Session: "encrypted-session-token",
    ChallengeResponses: {
        USERNAME: "user@example.com",
        ANSWER: "dummy", // Ignored, just a placeholder
    },
    ClientMetadata: {
        signInMethod: "MAGIC_LINK",
        redirectUri: "http://localhost:5173/auth-test",
        alreadyHaveMagicLink: "no",
    },
});
```

**Cognito → DefineAuthChallenge Lambda**:

- Lambda sees session has one entry with `challengeName: "CUSTOM_CHALLENGE"` and `challengeResult: false`
- Returns: `issueTokens: false`, `challengeName: "CUSTOM_CHALLENGE"` (continue authentication)

**Cognito → CreateAuthChallenge Lambda**:

- Lambda sees `signInMethod: "MAGIC_LINK"` in metadata
- Lambda sees `alreadyHaveMagicLink: "no"` → needs to create and send magic link
- Validates `redirectUri` is in allowed origins
- Calls magic link creation logic...

---

### Phase 3: Magic Link Creation & Email

**What happens**: Lambda creates a cryptographically signed magic link and sends it via email.

**CreateAuthChallenge Lambda**:

1. **Create JWT Payload**:

```javascript
{
  userName: "user@example.com",
  iat: 1708545893,  // issued at timestamp
  exp: 1708546793   // expires at timestamp (15 min later)
}
```

2. **Create Context**:

```javascript
{
  userPoolId: "eu-west-1_3DAfzFg4A",
  clientId: "3frk8crgtpd1bcdiig76ggea87"
}
```

3. **Sign with KMS**:

- Concatenate payload + context
- Hash with SHA-512
- Sign with KMS using RSA-PSS-SHA-512
- Result: cryptographic signature

4. **Store in DynamoDB**:

```javascript
{
  userNameHash: SHA256(salt + userName),
  signatureHash: SHA256(salt + signature),
  iat: 1708545893,
  exp: 1708546793,
  kmsKeyId: "arn:aws:kms:..."
}
```

- Conditional write: fails if link sent < 1 minute ago (rate limiting)

5. **Build Magic Link**:

```
http://localhost:5173/auth-test#<base64url(payload)>.<base64url(signature)>
```

6. **Send Email via SES**:

```html
Your secret sign-in link: <a href="...">sign in</a> This link is valid for 15
minutes
```

**Cognito → Browser**:

```javascript
{
  ChallengeName: "CUSTOM_CHALLENGE",
  Session: "new-encrypted-session-token",
  ChallengeParameters: { challenge: "PROVIDE_MAGIC_LINK" }
}
```

**Result**: User receives email with magic link. Browser has a new session token but authentication is not complete.

---

### Phase 4: User Clicks Magic Link

**What happens**: User clicks the link in their email, browser loads the page with the magic link in the URL hash.

**Email Link**:

```
http://localhost:5173/auth-test#eyJ1c2VyTmFtZSI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDg1NDU4OTMsImV4cCI6MTcwODU0Njc5M30.dGhpc19pc19hX3NpZ25hdHVyZV9leGFtcGxl
```

**Browser**:

- Loads page: `http://localhost:5173/auth-test`
- Hash fragment: `#<payload>.<signature>`
- JavaScript detects hash in URL
- Extracts email from JWT payload (base64 decode)
- Prepares to verify the magic link

**Result**: Browser has the magic link and email, ready to verify with Cognito.

---

### Phase 5: Magic Link Verification Request

**What happens**: Browser sends the magic link to Cognito for verification.

**Browser → Cognito** (Step 1 - Get new session):

```javascript
InitiateAuthCommand({
    AuthFlow: "CUSTOM_AUTH",
    ClientId: "your-client-id",
    AuthParameters: {
        USERNAME: "user@example.com",
    },
    ClientMetadata: {
        signInMethod: "MAGIC_LINK",
        redirectUri: "http://localhost:5173/auth-test",
        alreadyHaveMagicLink: "yes", // Important!
    },
});
```

**Cognito → DefineAuthChallenge Lambda**:

- Empty session → returns `CUSTOM_CHALLENGE`

**Cognito → CreateAuthChallenge Lambda**:

- Sees `alreadyHaveMagicLink: "yes"` → skips magic link creation
- Returns dummy challenge

**Cognito → Browser**:

```javascript
{
  ChallengeName: "CUSTOM_CHALLENGE",
  Session: "new-session-token"
}
```

**Browser → Cognito** (Step 2 - Verify magic link):

```javascript
RespondToAuthChallengeCommand({
    ChallengeName: "CUSTOM_CHALLENGE",
    ClientId: "your-client-id",
    Session: "new-session-token",
    ChallengeResponses: {
        USERNAME: "user@example.com",
        ANSWER: "<payload>.<signature>", // The magic link fragment!
    },
    ClientMetadata: {
        signInMethod: "MAGIC_LINK",
        redirectUri: "http://localhost:5173/auth-test",
        alreadyHaveMagicLink: "yes",
    },
});
```

**Cognito → VerifyAuthChallengeResponse Lambda**:

- Receives the magic link fragment as `challengeAnswer`
- Begins verification process...

---

### Phase 6: Magic Link Verification & Token Issuance

**What happens**: Lambda verifies the magic link cryptographically and Cognito issues authentication tokens.

**VerifyAuthChallengeResponse Lambda**:

1. **Parse Magic Link**:

```javascript
const [payloadB64, signatureB64] = challengeAnswer.split(".");
const payload = base64Decode(payloadB64);
const signature = base64Decode(signatureB64);
```

2. **Check DynamoDB** (Single-Use Enforcement):

```javascript
UpdateCommand({
    Key: { userNameHash: SHA256(salt + userName) },
    ConditionExpression: "signatureHash = :hash AND attribute_not_exists(uat)",
    UpdateExpression: "SET uat = :now",
});
```

- If `uat` (used at) already exists → link was already used → FAIL
- If signature hash doesn't match → invalid link → FAIL
- Otherwise, set `uat` to current timestamp and return the record

3. **Verify Expiration**:

```javascript
if (dbItem.exp < Date.now() / 1000) {
    return false; // Link expired
}
```

4. **Verify Signature with KMS Public Key**:

- Download KMS public key (cached)
- Reconstruct message: payload + context
- Verify RSA-PSS-SHA-512 signature
- If invalid → FAIL

5. **Verify Payload**:

```javascript
const parsed = JSON.parse(payload);
if (parsed.userName !== userName) return false;
if (parsed.exp !== dbItem.exp) return false;
if (parsed.iat !== dbItem.iat) return false;
```

6. **Return Result**:

```javascript
event.response.answerCorrect = true; // or false
```

**Cognito → DefineAuthChallenge Lambda**:

- Sees `challengeResult: true` (answer was correct)
- Returns: `issueTokens: true` → Authentication complete!

**Cognito → PreToken Lambda** (optional):

- Can modify token claims before issuance
- Current implementation: no modifications

**Cognito → Browser**:

```javascript
{
  AuthenticationResult: {
    AccessToken: "eyJraWQiOiJ...",
    IdToken: "eyJraWQiOiJ...",
    RefreshToken: "eyJjdHkiOiJ...",
    ExpiresIn: 3600,
    TokenType: "Bearer"
  }
}
```

**Browser**:

- Stores tokens (localStorage, sessionStorage, or memory)
- Clears magic link from URL
- User is now authenticated!

**Result**: User is fully authenticated with JWT tokens.

---

## Token Storage & Session Persistence

### Where Tokens Are Stored

The browser receives three tokens:

1. **Access Token**: Used for API authorization (short-lived, 1 hour)
2. **ID Token**: Contains user identity information (short-lived, 1 hour)
3. **Refresh Token**: Used to get new access/ID tokens (long-lived, 30 days)

### Storage Options

**Option 1: Memory (Most Secure)**

```javascript
let tokens = null; // Lost on page refresh
```

- Pros: Immune to XSS attacks
- Cons: Lost on page refresh

**Option 2: sessionStorage (Balanced)**

```javascript
sessionStorage.setItem("tokens", JSON.stringify(tokens));
```

- Pros: Persists during browser session, cleared when tab closes
- Cons: Vulnerable to XSS

**Option 3: localStorage (Persistent)**

```javascript
localStorage.setItem("tokens", JSON.stringify(tokens));
```

- Pros: Persists across browser restarts
- Cons: Vulnerable to XSS, persists indefinitely

**Option 4: HttpOnly Cookies (Backend Required)**

- Pros: Immune to XSS, can be Secure and SameSite
- Cons: Requires backend to set cookies

### Session Persistence

The encrypted session token from Cognito is NOT stored. It's only used during the authentication flow:

1. Browser gets session from `InitiateAuth`
2. Browser immediately sends it back in `RespondToAuthChallenge`
3. Session is discarded after authentication completes

Once authenticated, the browser uses the JWT tokens for subsequent requests, not the Cognito session.

---

## Why DynamoDB Is Needed

### 1. Single-Use Enforcement

Without DynamoDB, a magic link could be used multiple times:

- Attacker intercepts email
- User clicks link and authenticates
- Attacker uses the same link to authenticate

DynamoDB prevents this by storing a `uat` (used at) timestamp. The conditional update ensures only the first use succeeds.

### 2. Rate Limiting

Prevents abuse by limiting magic link requests:

```javascript
ConditionExpression: "attribute_not_exists(iat) OR iat < :threshold";
```

- Can't request new link if one was sent < 1 minute ago
- Prevents email flooding attacks

### 3. Expiration Tracking

Stores `exp` (expiration) timestamp:

- Lambda checks if link expired before verifying signature
- Expired links are rejected even if signature is valid

### 4. Signature Validation

Stores `signatureHash` to validate the link:

- Ensures the signature matches what was originally created
- Prevents tampering with the link

---

## Common Questions

### Q: What if I type a random email?

**Phase 1**: Cognito creates a session regardless of whether the user exists (prevents user enumeration).

**Phase 2**:

- If user doesn't exist: Lambda pretends to send email (adds random delay) but doesn't actually send
- If user exists: Lambda sends real magic link

This prevents attackers from discovering which emails are registered.

### Q: Can I reuse a magic link?

No. DynamoDB enforces single-use through the `uat` (used at) field. Once used, the conditional update fails on subsequent attempts.

### Q: What happens if the link expires?

The Lambda checks `exp` timestamp before verifying the signature. If expired, verification fails and no tokens are issued.

### Q: How does the browser "remember" the user?

It doesn't during authentication. The flow is stateless:

1. Browser gets session → sends it back immediately
2. Browser gets magic link → sends it back when clicked
3. Browser gets tokens → stores them for future API calls

The JWT tokens (not the Cognito session) are what persist the user's authenticated state.

### Q: Why two API calls when clicking the magic link?

1. **First call** (`InitiateAuth`): Get a fresh session with `alreadyHaveMagicLink: "yes"` to skip link creation
2. **Second call** (`RespondToAuthChallenge`): Submit the magic link for verification

This is required by Cognito's custom auth flow architecture.

---

## Configuration

### Environment Variables (Lambda)

```bash
MAGIC_LINK_ENABLED=true
SECONDS_UNTIL_EXPIRY=900           # 15 minutes
MIN_SECONDS_BETWEEN=60             # 1 minute rate limit
ALLOWED_ORIGINS=http://localhost:5173
SES_FROM_ADDRESS=security@awsbyivan.com
SES_REGION=eu-west-1
KMS_KEY_ID=arn:aws:kms:...
DYNAMODB_SECRETS_TABLE=magic-links-table
STACK_ID=unique-salt-value
```

### Frontend Configuration

```javascript
const CLIENT_ID = "3frk8crgtpd1bcdiig76ggea87";
const AWS_REGION = "eu-west-1";
```

---

## Troubleshooting

### "Invalid redirectUri: undefined"

**Cause**: `redirectUri` not passed in `ClientMetadata`

**Fix**: Ensure both `InitiateAuth` and `RespondToAuthChallenge` include:

```javascript
ClientMetadata: {
    redirectUri: window.location.origin + "/auth-test";
}
```

### "Email address is not verified"

**Cause**: SES sender email not verified (SES sandbox mode)

**Fix**: Verify the sender email in Amazon SES console

### "Magic link expired"

**Cause**: Link older than 15 minutes

**Fix**: Request a new magic link

### "Attempt to use invalid magic link"

**Causes**:

1. Link already used (single-use enforcement)
2. Signature doesn't match DynamoDB record
3. Link was tampered with

**Fix**: Request a new magic link

---

## Security Considerations

1. **Always use HTTPS in production** - Magic links in URLs can be logged
2. **Set short expiration times** - Default 15 minutes is reasonable
3. **Use HttpOnly cookies** - If possible, store tokens in HttpOnly cookies
4. **Implement CORS properly** - Restrict `allowedOrigins` to your domains
5. **Monitor for abuse** - Watch for excessive magic link requests
6. **Clear links from URL** - Remove hash fragment after authentication
7. **Verify SES sender** - Prevent email spoofing
8. **Use KMS for signing** - Never use symmetric keys or client-side signing

---

## Summary

The magic link authentication flow is a secure, passwordless authentication method that:

1. Uses cryptographic signatures (KMS) to ensure link authenticity
2. Enforces single-use links through DynamoDB
3. Implements rate limiting to prevent abuse
4. Validates origins to prevent phishing
5. Issues standard JWT tokens for API authorization

The flow requires 6 Lambda functions working together with Cognito's custom auth triggers to provide a seamless, secure authentication experience.
