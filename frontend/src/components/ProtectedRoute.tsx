import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export default function ProtectedRoute({
    children,
    redirectTo = "/login",
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    // Force redirect when authentication status changes
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log("Authentication lost, redirecting to login...");
            navigate(redirectTo, { state: { from: location }, replace: true });
        }
    }, [isAuthenticated, isLoading, navigate, redirectTo, location]);

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                }}
            >
                <div className="passwordless-loading-spinner" />
                <span style={{ marginLeft: "1rem" }}>Loading...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Redirect to login but save the attempted location
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
