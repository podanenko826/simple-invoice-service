import { createContext } from "react";
import type { TokensFromSignIn } from "./model.js";

export interface AuthContextType {
    tokens: TokensFromSignIn | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    signOut: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    reloadTokens: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined,
);
