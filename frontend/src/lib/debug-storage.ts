// Debug utilities for local storage
export const debugStorage = {
    logTemplate: () => {
        try {
            const template = localStorage.getItem("invoice-template");
            console.log(
                "📋 Template in localStorage:",
                template ? JSON.parse(template) : null,
            );

            if (template) {
                const parsed = JSON.parse(template);
                console.log("🖼️ Logo present:", !!parsed.companyLogo);
                if (parsed.companyLogo) {
                    console.log(
                        "🖼️ Logo size:",
                        parsed.companyLogo.length,
                        "characters",
                    );
                    console.log(
                        "🖼️ Logo type:",
                        parsed.companyLogo.substring(0, 50) + "...",
                    );
                }
            }
        } catch (error) {
            console.error(
                "❌ Error reading template from localStorage:",
                error,
            );
        }
    },

    logInvoices: () => {
        try {
            const invoices = localStorage.getItem("invoice-history");
            console.log(
                "📄 Invoices in localStorage:",
                invoices ? JSON.parse(invoices) : null,
            );
        } catch (error) {
            console.error(
                "❌ Error reading invoices from localStorage:",
                error,
            );
        }
    },

    clearAll: () => {
        localStorage.removeItem("invoice-template");
        localStorage.removeItem("invoice-history");
        console.log("🗑️ Cleared all local storage");
    },
};

// Make it available globally for debugging
if (typeof window !== "undefined") {
    (window as any).debugStorage = debugStorage;
}
