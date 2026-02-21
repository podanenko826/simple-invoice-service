# Magic Link Authentication - Frontend Usage Guide

This guide explains how to use the passwordless magic link authentication in your React application.

## Setup

The authentication library is located in `src/lib/auth/` and includes all necessary components for passwordless authentication with AWS Cognito.

### 1. Configuration

First, configure the Passwordless library with your Cognito settings:

```typescript
import { Passwordless } from "./lib/auth/index.js";

Passwordless.configure({
    clientId: "YOUR_COGNITO_CLIENT_ID",
    cognitoIdpEndpoint: "YOUR_AWS_REGION", // e.g., "eu-west-1"
});
```

You can also configure it from Amplify config:

```typescript
import { Passwordless } from "./lib/auth/index.js";

Passwordless.configureFromAmplify({
    region: "eu-west-1",
    userPoolId: "eu-west-1_XXXXXXXXX",
    userPoolWebClientId: "YOUR_CLIENT_ID",
});
```

### 2. Request Magic Link

To request a magic link for a user:

```typescript
import { requestSignInLink } from "./lib/auth/magic-link.js";

const { signInLinkRequested, abort } = requestSignInLink({
    username: "user@example.com",
    statusCb: (status) => {
        console.log("Status:", status);
    },
});

// Wait for the request to complete
signInLinkRequested
    .then(() => {
        console.log("Magic link sent!");
    })
    .catch((error) => {
        console.error("Error:", error);
    });

// Optionally abort the request
// abort();
```

### 3. Sign In with Magic Link

When the user clicks the magic link in their email, they'll be redirected to your app with the link in the URL hash. Use `signInWithLink` to automatically detect and verify the link:

```typescript
import { signInWithLink } from "./lib/auth/magic-link.js";

const { signedIn, abort } = signInWithLink({
    statusCb: (status) => {
        console.log("Status:", status);
    },
    tokensCb: (tokens) => {
        console.log("Authenticated!", tokens);
        // tokens contains: accessToken, idToken, refreshToken, expireAt, username
    },
});

// Wait for sign-in to complete
signedIn
    .then((tokens) => {
        if (tokens) {
            console.log("Successfully signed in:", tokens);
        }
    })
    .catch((error) => {
        console.error("Sign-in error:", error);
    });
```

### 4. Token Storage

By default, tokens are automatically stored in localStorage (or sessionStorage/memory depending on configuration). The library uses Amplify-compatible storage keys, so tokens can be used with AWS Amplify libraries.

To retrieve stored tokens:

```typescript
import { retrieveTokens } from "./lib/auth/storage.js";

const tokens = await retrieveTokens();
if (tokens) {
    console.log("User is signed in:", tokens.username);
}
```

### 5. Token Refresh

Tokens are automatically refreshed before they expire. The library schedules refresh 30 seconds before expiration.

To manually refresh tokens:

```typescript
import { refreshTokens } from "./lib/auth/refresh.js";

const newTokens = await refreshTokens({
    tokensCb: (tokens) => {
        console.log("Tokens refreshed:", tokens);
    },
});
```

### 6. Sign Out

To sign out a user:

```typescript
import { signOut } from "./lib/auth/common.js";

const { signedOut, abort } = signOut({
    statusCb: (status) => {
        console.log("Status:", status);
    },
    tokensRemovedLocallyCb: () => {
        console.log("Tokens removed from storage");
    },
});

signedOut
    .then(() => {
        console.log("Successfully signed out");
    })
    .catch((error) => {
        console.error("Sign-out error:", error);
    });
```

## Status Values

The `statusCb` callback receives one of these status values:

### Busy States (operations in progress)

- `REQUESTING_SIGNIN_LINK` - Requesting magic link from server
- `SIGNING_IN_WITH_LINK` - Verifying magic link and authenticating
- `SIGNING_OUT` - Signing out user

### Idle States (operations complete)

- `NO_SIGNIN_LINK` - No magic link found in URL
- `SIGNIN_LINK_REQUESTED` - Magic link successfully sent
- `SIGNIN_LINK_REQUEST_FAILED` - Failed to request magic link
- `SIGNED_IN_WITH_LINK` - Successfully authenticated with magic link
- `SIGNIN_LINK_EXPIRED` - Magic link has expired
- `INVALID_SIGNIN_LINK` - Magic link is invalid
- `SIGNED_OUT` - Successfully signed out

## Token Structure

The tokens object contains:

```typescript
{
    accessToken: string; // JWT access token for API calls
    idToken: string; // JWT ID token with user info
    refreshToken: string; // Token to refresh access/ID tokens
    expireAt: Date; // When tokens expire
    username: string; // Cognito username
}
```

## Complete Example

See `src/pages/Login.tsx` for a complete working example that demonstrates:

- Requesting a magic link
- Automatically detecting and verifying magic links from URL
- Displaying authentication status
- Showing tokens after successful authentication
- Error handling

## Running the Example

1. Update the configuration in `src/pages/Login.tsx` with your Cognito Client ID and region
2. Start the dev server: `npm run dev`
3. Navigate to `http://localhost:5173/login`
4. Enter your email and click "Send Magic Link"
5. Check your email and click the link
6. You'll be redirected back and automatically authenticated

## Configuration Options

### Storage

By default, the library uses `localStorage`. You can configure a different storage:

```typescript
Passwordless.configure({
    clientId: "YOUR_CLIENT_ID",
    cognitoIdpEndpoint: "eu-west-1",
    storage: sessionStorage, // or custom storage implementation
});
```

### Custom Storage

Implement the `CustomStorage` interface:

```typescript
const customStorage = {
    getItem: async (key: string) => {
        // Return stored value or null
    },
    setItem: async (key: string, value: string) => {
        // Store value
    },
    removeItem: async (key: string) => {
        // Remove value
    },
};

Passwordless.configure({
    clientId: "YOUR_CLIENT_ID",
    cognitoIdpEndpoint: "eu-west-1",
    storage: customStorage,
});
```

### Debug Logging

Enable debug logging:

```typescript
Passwordless.configure({
    clientId: "YOUR_CLIENT_ID",
    cognitoIdpEndpoint: "eu-west-1",
    debug: console.debug, // or your custom logger
});
```

## Security Best Practices

1. **Always use HTTPS in production** - Magic links in URLs can be logged
2. **Set short expiration times** - Default is 15 minutes
3. **Use HttpOnly cookies if possible** - Store tokens in HttpOnly cookies instead of localStorage
4. **Implement CORS properly** - Restrict allowed origins in your Cognito configuration
5. **Monitor for abuse** - Watch for excessive magic link requests
6. **Clear links from URL** - The library automatically removes the hash fragment after authentication

## Troubleshooting

### "Invalid redirectUri: undefined"

Make sure you're passing `redirectUri` in the `requestSignInLink` call:

```typescript
requestSignInLink({
    username: email,
    redirectUri: window.location.origin + "/login",
});
```

### "Email address is not verified"

In SES sandbox mode, you must verify both the sender and recipient email addresses in the Amazon SES console.

### "Magic link expired"

Magic links expire after 15 minutes (configurable in the backend). Request a new link.

### "Attempt to use invalid magic link"

This can happen if:

- The link was already used (single-use enforcement)
- The link was tampered with
- The signature doesn't match

Request a new magic link.

## API Reference

### `Passwordless.configure(config)`

Configure the authentication library.

**Parameters:**

- `config.clientId` (required) - Cognito Client ID
- `config.cognitoIdpEndpoint` (required) - AWS region or full Cognito endpoint URL
- `config.userPoolId` (optional) - Cognito User Pool ID
- `config.storage` (optional) - Storage implementation (default: localStorage)
- `config.debug` (optional) - Debug logging function
- `config.fetch` (optional) - Custom fetch implementation
- `config.crypto` (optional) - Custom crypto implementation

### `requestSignInLink(options)`

Request a magic link to be sent to the user's email.

**Parameters:**

- `options.username` (required) - Email address or username
- `options.redirectUri` (optional) - URL to redirect to after clicking link
- `options.statusCb` (optional) - Callback for status updates
- `options.currentStatus` (optional) - Current authentication status

**Returns:**

- `signInLinkRequested` - Promise that resolves when link is sent
- `abort()` - Function to abort the request

### `signInWithLink(options)`

Detect and verify a magic link in the current URL.

**Parameters:**

- `options.session` (optional) - Existing Cognito session
- `options.tokensCb` (optional) - Callback when tokens are received
- `options.statusCb` (optional) - Callback for status updates

**Returns:**

- `signedIn` - Promise that resolves with tokens
- `abort()` - Function to abort the sign-in

### `signOut(options)`

Sign out the current user.

**Parameters:**

- `options.currentStatus` (optional) - Current authentication status
- `options.tokensRemovedLocallyCb` (optional) - Callback when tokens are removed
- `options.statusCb` (optional) - Callback for status updates

**Returns:**

- `signedOut` - Promise that resolves when signed out
- `abort()` - Function to abort the sign-out

### `retrieveTokens()`

Retrieve stored tokens from storage.

**Returns:** Promise that resolves with tokens or undefined

### `refreshTokens(options)`

Manually refresh authentication tokens.

**Parameters:**

- `options.abort` (optional) - AbortSignal to cancel the request
- `options.tokensCb` (optional) - Callback when tokens are refreshed
- `options.isRefreshingCb` (optional) - Callback for refresh status

**Returns:** Promise that resolves with new tokens
