# Authentication Flow & Token Management

## Overview

OneThing Invoice uses **passwordless authentication** with magic links powered by AWS Cognito. Here's how it works from start to finish.

---

## 1. User Requests Magic Link

**Location**: `frontend/src/pages/Login.tsx`

```typescript
// User enters email and clicks "Send magic link"
handleRequestLink() {
  requestSignInLink({
    username: email,
    statusCb: setStatus,
  });
}
```

**What happens:**
1. Frontend calls Cognito `InitiateAuth` API
2. Cognito triggers `CreateAuthChallenge` Lambda
3. Lambda generates a cryptographically signed magic link
4. Lambda sends email via SendGrid
5. Link format: `https://makeinvoices.app/#<signed-token>`

**Rate Limiting**: 60 seconds between requests per email

---

## 2. User Clicks Magic Link

**Location**: `frontend/src/lib/auth/magic-link.ts`

```typescript
// Magic link opens: https://makeinvoices.app/#eyJ1c2VyTmFtZSI6...
signInWithLink({
  tokensCb: async (tokens) => {
    await storeTokens(tokens);
    await reloadTokens();
    navigate("/workspace");
  }
});
```

**What happens:**
1. Frontend detects fragment identifier (`#...`) in URL
2. Parses and validates the signed token
3. Calls Cognito `RespondToAuthChallenge` with the token
4. Cognito triggers `VerifyAuthChallengeResponse` Lambda
5. Lambda verifies signature and checks expiration
6. Cognito returns JWT tokens if valid

**Link Expiration**: 15 minutes (900 seconds)

---

## 3. Tokens Are Stored in Browser

**Location**: `frontend/src/lib/auth/storage.ts`

### Storage Location: `localStorage`

```typescript
// Tokens stored with these keys:
CognitoIdentityServiceProvider.{clientId}.LastAuthUser = "user@example.com"
CognitoIdentityServiceProvider.{clientId}.{username}.idToken = "eyJraWQ..."
CognitoIdentityServiceProvider.{clientId}.{username}.accessToken = "eyJraWQ..."
CognitoIdentityServiceProvider.{clientId}.{username}.refreshToken = "eyJjdHk..."
Passwordless.{clientId}.{username}.expireAt = "2025-02-28T12:00:00.000Z"
```

### What Gets Stored:

1. **ID Token** (JWT)
   - Contains user identity (email, sub, username)
   - Used for authentication
   - Short-lived

2. **Access Token** (JWT)
   - Used for API authorization
   - Sent in `Authorization: Bearer <token>` header
   - Short-lived

3. **Refresh Token** (Opaque)
   - Used to get new ID/Access tokens
   - Long-lived
   - Cannot be decoded (encrypted by Cognito)

4. **Expiration Time**
   - When current tokens expire
   - Used to schedule automatic refresh

---

## 4. Token Lifetimes

### Default Cognito Settings (when not explicitly configured):

| Token Type | Default Lifetime | Purpose |
|------------|------------------|---------|
| **ID Token** | 1 hour | User identity |
| **Access Token** | 1 hour | API authorization |
| **Refresh Token** | 30 days | Get new tokens |

### How Long User Stays Authenticated:

```
Initial Login → 1 hour (access token valid)
                ↓
After 1 hour → Auto-refresh (if refresh token valid)
                ↓
After 30 days → Must login again (refresh token expired)
```

**In Practice:**
- User stays logged in for **30 days** (as long as they use the app)
- Tokens auto-refresh every hour
- After 30 days of inactivity → must get new magic link

---

## 5. Automatic Token Refresh

**Location**: `frontend/src/lib/auth/refresh.ts`

```typescript
// Scheduled 30 seconds before expiry
scheduleRefresh({
  tokensCb: (refreshedTokens) => {
    // Update tokens in memory and storage
    setTokens(refreshedTokens);
  }
});
```

**How it works:**
1. App calculates when tokens expire (from `expireAt`)
2. Schedules refresh 30 seconds before expiration
3. Calls Cognito `InitiateAuth` with `REFRESH_TOKEN_AUTH`
4. Gets new ID and Access tokens (refresh token stays same)
5. Updates localStorage with new tokens
6. Schedules next refresh

**User Experience:**
- Seamless - no interruption
- Happens in background
- User never sees it

---

## 6. Token Validation on API Calls

**Location**: `frontend/src/lib/api-client.ts`

```typescript
async function fetchWithAuth(endpoint: string) {
  const tokens = await retrieveTokens();
  
  if (!tokens?.idToken) {
    throw new ApiError("Not authenticated", 401);
  }
  
  const response = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${tokens.idToken}`,
    },
  });
}
```

**Backend Validation:**
- API Gateway validates JWT signature
- Checks token hasn't expired
- Verifies token issued by correct Cognito User Pool
- Extracts user ID from token claims

---

## 7. Session Persistence

### Across Browser Tabs:
✅ **Yes** - localStorage is shared across tabs

### Across Browser Restarts:
✅ **Yes** - localStorage persists until cleared

### Across Devices:
❌ **No** - Each device needs separate login

### Incognito/Private Mode:
⚠️ **Temporary** - Cleared when window closes

---

## 8. Sign Out

**Location**: `frontend/src/components/Header.tsx`

```typescript
// User clicks "Sign out" button in header
handleSignOut = async () => {
  await signOut();
  navigate("/");
}
```

**What happens:**
1. User clicks "Sign out" button (visible when authenticated)
2. Calls `signOut()` from AuthContext
3. Removes all tokens from localStorage
4. Clears in-memory token state
5. Redirects to home page
6. User must get new magic link to sign in again

**Where it appears:**
- Header navigation (top right)
- Only visible when user is authenticated
- Available on all pages when logged in

---

## 9. Security Features

### Token Storage Security:

| Feature | Status | Details |
|---------|--------|---------|
| **HttpOnly Cookies** | ❌ No | Using localStorage (standard for SPAs) |
| **Secure Flag** | N/A | Not using cookies |
| **SameSite** | N/A | Not using cookies |
| **XSS Protection** | ⚠️ Partial | Vulnerable if XSS exists |
| **CSRF Protection** | ✅ Yes | No cookies = no CSRF |

### Token Security:

| Feature | Status | Details |
|---------|--------|---------|
| **JWT Signature** | ✅ Yes | RS256 (RSA + SHA-256) |
| **Token Expiration** | ✅ Yes | 1 hour for access/ID tokens |
| **Refresh Rotation** | ❌ No | Same refresh token reused |
| **Token Revocation** | ⚠️ Limited | Can disable user in Cognito |

### Best Practices Implemented:

✅ Short-lived access tokens (1 hour)
✅ Automatic token refresh
✅ Secure token transmission (HTTPS only)
✅ Token validation on every API call
✅ Magic link expiration (15 minutes)
✅ One-time use magic links
✅ Rate limiting on magic link requests

---

## 10. Troubleshooting

### User Can't Stay Logged In:

**Possible causes:**
1. Browser clearing localStorage
2. Incognito/Private mode
3. Browser extension blocking storage
4. Refresh token expired (30 days)

**Solution:**
- Check browser settings
- Disable aggressive privacy extensions
- Re-login if refresh token expired

### Tokens Not Refreshing:

**Possible causes:**
1. Refresh token invalid/expired
2. Network error during refresh
3. Cognito User Pool misconfigured

**Solution:**
- Check browser console for errors
- Verify Cognito User Pool settings
- Force re-login

### "Not authenticated" Errors:

**Possible causes:**
1. Tokens expired and refresh failed
2. localStorage cleared
3. Invalid token signature

**Solution:**
- Sign out and sign in again
- Check if localStorage is enabled
- Verify API Gateway authorizer config

---

## 11. Customizing Token Lifetimes

To change token lifetimes, update the Cognito User Pool Client:

```typescript
// In infra/stacks/constructs/cognito-paswordless/cognito-paswordless.ts
this.userPoolClient = this.userPool.addClient(`UserPoolClient${id}`, {
  authFlows: {
    custom: true,
  },
  // Add these settings:
  accessTokenValidity: cdk.Duration.hours(1),      // Default: 1 hour
  idTokenValidity: cdk.Duration.hours(1),          // Default: 1 hour  
  refreshTokenValidity: cdk.Duration.days(30),     // Default: 30 days
});
```

**Recommendations:**
- **Access/ID tokens**: 1 hour (good balance)
- **Refresh token**: 30 days (standard for web apps)
- **Magic link**: 15 minutes (security vs UX)

---

## 12. Monitoring Authentication

### CloudWatch Metrics to Watch:

```typescript
// Cognito User Pool Metrics
- SignInSuccesses
- SignInThrottles  
- TokenRefreshSuccesses
- TokenRefreshFailures

// API Gateway Metrics
- 4XXError (authentication failures)
- Latency (token validation time)
```

### Logs to Check:

```bash
# Cognito Lambda triggers
/aws/lambda/CreateAuthChallenge
/aws/lambda/VerifyAuthChallengeResponse
/aws/lambda/DefineAuthChallenge

# API Gateway access logs
/aws/apigateway/invoice-api-prod
```

---

## Summary

**Authentication Flow:**
1. User requests magic link → Email sent
2. User clicks link → Tokens issued
3. Tokens stored in localStorage
4. Tokens auto-refresh every hour
5. User stays logged in for 30 days
6. After 30 days → Must login again

**Token Lifetimes:**
- Magic link: 15 minutes
- Access/ID tokens: 1 hour
- Refresh token: 30 days
- Session: 30 days (with auto-refresh)

**Storage:**
- Location: Browser localStorage
- Persistence: Across tabs and restarts
- Security: Standard for SPAs, vulnerable to XSS

**Key Features:**
- Passwordless (magic links only)
- Automatic token refresh
- Rate limiting (60s between requests)
- One-time use links
- Cryptographic signing
