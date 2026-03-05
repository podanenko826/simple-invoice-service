import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { retrieveTokens } from "./storage.js";
import { signOut as authSignOut } from "./common.js";
import { refreshTokens, scheduleRefresh } from "./refresh.js";
import type { TokensFromSignIn } from "./model.js";

interface AuthContextType {
    tokens: TokensFromSignIn | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signOut: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    reloadTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [tokens, setTokens] = useState<TokensFromSignIn | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load tokens on mount
    useEffect(() => {
        retrieveTokens()
            .then((storedTokens) => {
                if (storedTokens) {
                    setTokens(storedTokens as TokensFromSignIn);
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    // Schedule automatic token refresh
    useEffect(() => {
        if (!tokens) return;

        const abort = new AbortController();
        
        scheduleRefresh({
            abort: abort.signal,
            tokensCb: (refreshedTokens) => {
                setTokens((prev) =>
                    prev
                        ? { ...prev, ...refreshedTokens }
                        : (refreshedTokens as TokensFromSignIn),
                );
            },
            isRefreshingCb: (isRefreshing) => {
            },
        });

        return () => {
            abort.abort();
        };
    }, [!!tokens]);

    // Refresh tokens
    const refreshAuth = useCallback(async () => {
        try {
            await refreshTokens({
                tokensCb: (refreshedTokens) => {
                    setTokens((prev) =>
                        prev
                            ? { ...prev, ...refreshedTokens }
                            : (refreshedTokens as TokensFromSignIn),
                    );
                },
            });
        } catch (error) {
            console.error("Failed to refresh tokens:", error);
            setTokens(null);
            throw error;
        }
    }, []);

    // Sign out
    const signOut = useCallback(async () => {
        const { signedOut } = authSignOut({
            tokensRemovedLocallyCb: () => {
                setTokens(null);
            },
        });
        await signedOut;
    }, []);

    // Reload tokens from storage
    const reloadTokens = useCallback(async () => {
        const storedTokens = await retrieveTokens();
        if (storedTokens) {
            setTokens(storedTokens as TokensFromSignIn);
        }
    }, []);

    const value: AuthContextType = {
        tokens,
        isAuthenticated: !!tokens,
        isLoading,
        signOut,
        refreshAuth,
        reloadTokens,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

// Hook to require authentication
export function useRequireAuth() {
    const { isAuthenticated, isLoading } = useAuth();
    return { isAuthenticated, isLoading };
}
