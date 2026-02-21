import Header from "@/components/Header";
import { useAuth } from "@/lib/auth/AuthContext";

const InvoiceWorkspace = () => {
    const { tokens, signOut } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="container py-10">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Invoice Workspace
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Welcome back, {tokens?.username ?? "user"}
                        </p>
                    </div>
                    <button
                        onClick={signOut}
                        className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                        Sign out
                    </button>
                </div>

                <div className="rounded-xl border border-border bg-card p-12 text-center">
                    <p className="text-muted-foreground">
                        Your invoice workspace is ready. Start creating invoices
                        here.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InvoiceWorkspace;
