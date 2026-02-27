import { useContext } from "react";
import { AuthContext } from "./context.js";

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
