import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Shield } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext";
import { requestSignInLink, signInWithLink } from "../lib/auth/magic-link.js";
import { storeTokens } from "../lib/auth/storage.js";
import type { BusyState, IdleState } from "../lib/auth/model.js";

const Login = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<BusyState | IdleState | "">("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { reloadTokens } = useAuth();
    const hasProcessedLink = useRef(false);

    // Check for magic link in URL on page load
    useEffect(() => {
        if (hasProcessedLink.current) return;
        hasProcessedLink.current = true;

        const { signedIn } = signInWithLink({
            statusCb: setStatus,
            tokensCb: async (tokens) => {
                await storeTokens(tokens);
                await reloadTokens();
                navigate("/workspace");
            },
        });

        signedIn.catch((err) => {
            console.error("Sign-in error:", err);
            if (err.name !== "NoSignInLinkFoundError") {
                setError(err.message);
            }
        });
    }, [navigate, reloadTokens]);

    const handleRequestLink = () => {
        setError("");
        const { signInLinkRequested } = requestSignInLink({
            username: email,
            statusCb: setStatus,
        });

        signInLinkRequested.catch((err) => {
            console.error("Error requesting magic link:", err);
            setError(err.message);
        });
    };

    const isLoading =
        status === "REQUESTING_SIGNIN_LINK" ||
        status === "SIGNING_IN_WITH_LINK";

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="w-full max-w-md space-y-6">
                {/* Headline */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-semibold text-foreground">
                        Start your invoice.
                    </h1>
                    <p className="text-muted-foreground">
                        Enter your email. We'll send a secure magic link.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-3">
                    <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="h-12 text-base"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && email && !isLoading) {
                                handleRequestLink();
                            }
                        }}
                    />
                    <Button
                        onClick={handleRequestLink}
                        disabled={!email || isLoading}
                        className="w-full h-12 text-base font-semibold gap-2 shadow-md"
                    >
                        {isLoading ? (
                            <>
                                <span className="passwordless-loading-spinner" />
                                {status === "REQUESTING_SIGNIN_LINK"
                                    ? "Sending..."
                                    : "Signing in..."}
                            </>
                        ) : (
                            <>
                                Send magic link
                                <ArrowRight className="h-4 w-4" />
                            </>
                        )}
                    </Button>

                    {/* Trust line */}
                    <p className="text-center text-xs text-muted-foreground/60 pt-1">
                        No password required. No account setup. No signup forms.
                    </p>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 pt-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                        <Lock className="h-3.5 w-3.5" />
                        <span>256-bit encryption</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
                        <Shield className="h-3.5 w-3.5" />
                        <span>Secure authentication</span>
                    </div>
                </div>

                {/* Status messages */}
                <div className="text-center space-y-2">
                    {status === "SIGNIN_LINK_REQUESTED" && (
                        <p className="text-sm text-primary">
                            ✓ Magic link sent! Check your email.
                        </p>
                    )}

                    {status === "SIGNIN_LINK_EXPIRED" && (
                        <p className="text-sm text-destructive">
                            Magic link has expired. Please request a new one.
                        </p>
                    )}

                    {status === "INVALID_SIGNIN_LINK" && (
                        <p className="text-sm text-destructive">
                            Invalid magic link. Please request a new one.
                        </p>
                    )}

                    {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
