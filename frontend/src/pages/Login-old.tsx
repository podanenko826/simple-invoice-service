import { useState, useEffect } from "react";
import { Passwordless } from "../lib/auth/index.js";
import { requestSignInLink, signInWithLink } from "../lib/auth/magic-link.js";
import type { BusyState, IdleState } from "../lib/auth/model.js";
import type { TokensFromSignIn } from "../lib/auth/model.js";
import "../lib/auth/paswordless.css";

// Configure the Passwordless library
Passwordless.configure({
    clientId: "3frk8crgtpd1bcdiig76ggea87", // Replace with your Cognito Client ID
    cognitoIdpEndpoint: "eu-west-1", // Replace with your AWS region
});

export default function Login() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<BusyState | IdleState | "">("");
    const [tokens, setTokens] = useState<TokensFromSignIn | null>(null);
    const [error, setError] = useState("");

    // Check for magic link in URL on page load
    useEffect(() => {
        console.log("useEffect");
        const { signedIn } = signInWithLink({
            statusCb: setStatus,
            tokensCb: (tokens) => {
                setTokens(tokens);
                console.log("Authenticated with tokens:", tokens);
            },
        });

        signedIn.catch((err) => {
            console.error("Sign-in error:", err);
            setError(err.message);
        });
    }, []);

    const handleRequestLink = () => {
        setError("");
        const { signInLinkRequested } = requestSignInLink({
            username: email,
            statusCb: setStatus,
        });

        signInLinkRequested
            .then(() => {
                console.log("Magic link requested successfully");
            })
            .catch((err) => {
                console.error("Error requesting magic link:", err);
                setError(err.message);
            });
    };

    if (tokens) {
        return (
            <div className="passwordless-main-container">
                <div className="passwordless-card-container">
                    <h2>Successfully Authenticated!</h2>
                    <div className="passwordless-text-left">
                        <p>
                            <strong>Username:</strong> {tokens.username}
                        </p>
                        <p>
                            <strong>Access Token:</strong>{" "}
                            <code
                                style={{
                                    fontSize: "0.8em",
                                    wordBreak: "break-all",
                                }}
                            >
                                {tokens.accessToken.substring(0, 50)}...
                            </code>
                        </p>
                        <p>
                            <strong>ID Token:</strong>{" "}
                            <code
                                style={{
                                    fontSize: "0.8em",
                                    wordBreak: "break-all",
                                }}
                            >
                                {tokens.idToken.substring(0, 50)}...
                            </code>
                        </p>
                        <p>
                            <strong>Expires:</strong>{" "}
                            {tokens.expireAt.toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="passwordless-main-container">
            <div className="passwordless-card-container">
                <h2 className="passwordless-email-title">
                    Sign in with Magic Link
                </h2>

                <div className="passwordless-flex-col">
                    <div
                        className="passwordless-flex-col"
                        style={{ width: "100%" }}
                    >
                        <label className="passwordless-input-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            className="passwordless-email-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={
                                status === "REQUESTING_SIGNIN_LINK" ||
                                status === "SIGNING_IN_WITH_LINK"
                            }
                        />
                    </div>

                    <button
                        className="passwordless-button passwordless-button-sign-in"
                        onClick={handleRequestLink}
                        disabled={
                            !email ||
                            status === "REQUESTING_SIGNIN_LINK" ||
                            status === "SIGNING_IN_WITH_LINK"
                        }
                    >
                        {status === "REQUESTING_SIGNIN_LINK" ? (
                            <>
                                <span className="passwordless-loading-spinner" />{" "}
                                Sending...
                            </>
                        ) : status === "SIGNING_IN_WITH_LINK" ? (
                            <>
                                <span className="passwordless-loading-spinner" />{" "}
                                Signing in...
                            </>
                        ) : (
                            "Send Magic Link"
                        )}
                    </button>

                    {status === "SIGNIN_LINK_REQUESTED" && (
                        <div className="passwordless-flex-col">
                            <p>✅ Magic link sent! Check your email.</p>
                            <p style={{ fontSize: "0.9em", color: "#666" }}>
                                Click the link in your email to sign in.
                            </p>
                        </div>
                    )}

                    {status === "SIGNIN_LINK_EXPIRED" && (
                        <div className="passwordless-error">
                            ⚠️ Magic link has expired. Please request a new one.
                        </div>
                    )}

                    {status === "INVALID_SIGNIN_LINK" && (
                        <div className="passwordless-error">
                            ⚠️ Invalid magic link. Please request a new one.
                        </div>
                    )}

                    {error && (
                        <div className="passwordless-error">
                            ⚠️ Error: {error}
                        </div>
                    )}

                    {status && (
                        <p style={{ fontSize: "0.8em", color: "#999" }}>
                            Status: {status}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
