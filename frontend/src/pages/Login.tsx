import SISLogoIcon from "@/components/SISLogoIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthContext";
import { requestSignInLink, signInWithLink } from "../lib/auth/magic-link.js";
import { storeTokens } from "../lib/auth/storage.js";
import type { BusyState, IdleState } from "../lib/auth/model.js";
import Header from "@/components/Header.js";

const Login = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<BusyState | IdleState | "">("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { reloadTokens } = useAuth();
    const hasProcessedLink = useRef(false);

    // Check for magic link in URL on page load
    useEffect(() => {
        // Only process if there's a hash in the URL
        if (!window.location.hash) {
            return;
        }

        // Prevent double execution
        if (hasProcessedLink.current) {
            return;
        }
        hasProcessedLink.current = true;

        const { signedIn } = signInWithLink({
            statusCb: setStatus,
            tokensCb: async (tokens) => {
                // Store tokens to localStorage
                await storeTokens(tokens);
                // Reload tokens from storage into auth context
                await reloadTokens();
                navigate("/workspace", { replace: true });
            },
        });

        signedIn.catch((err) => {
            console.error("Sign-in error:", err);
            setError(err.message);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run once on mount

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

    const isBusy =
        status === "REQUESTING_SIGNIN_LINK" ||
        status === "SIGNING_IN_WITH_LINK";

    return (
        <>
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center px-6 bg-background">
                    <div className="flex flex-col items-center text-center max-w-lg">
                        {/* Logo + Wordmark */}
                        <div className="mb-6 animate-float">
                            <SISLogoIcon size={80} />
                        </div>
                        <h1 className="text-5xl font-extrabold tracking-tight text-navy sm:text-6xl">
                            SIS
                        </h1>
                        <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground font-medium">
                            Simple Invoice Service
                        </p>

                        {/* Tagline */}
                        <p className="mt-6 max-w-md text-center text-muted-foreground text-lg leading-relaxed">
                            Fill your invoice template once. Generate monthly
                            invoices in seconds.
                        </p>

                        {/* Form */}
                        <div className="mt-10 w-full max-w-sm space-y-4">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isBusy}
                                className="h-12 rounded-lg border-border bg-card text-sm"
                            />
                            <Button
                                className="w-full h-12 rounded-lg text-sm font-semibold gap-2"
                                onClick={handleRequestLink}
                                disabled={!email || isBusy}
                            >
                                {status === "REQUESTING_SIGNIN_LINK" ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : status === "SIGNING_IN_WITH_LINK" ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    <>
                                        Log in with Email
                                        <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Status messages */}
                        {status === "SIGNIN_LINK_REQUESTED" && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span>Magic link sent! Check your email.</span>
                            </div>
                        )}

                        {status === "SIGNIN_LINK_EXPIRED" && (
                            <div className="mt-4 text-sm text-destructive">
                                ⚠️ Magic link has expired. Please request a new
                                one.
                            </div>
                        )}

                        {status === "INVALID_SIGNIN_LINK" && (
                            <div className="mt-4 text-sm text-destructive">
                                ⚠️ Invalid magic link. Please request a new one.
                            </div>
                        )}

                        {error && (
                            <div className="mt-4 text-sm text-destructive">
                                ⚠️ {error}
                            </div>
                        )}

                        {/* Helper text */}
                        <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
                            <Mail className="h-3.5 w-3.5" />
                            <span>
                                We'll send you a magic link — no password needed
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
