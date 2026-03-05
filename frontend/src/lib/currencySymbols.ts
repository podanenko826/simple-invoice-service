// Re-export from centralized currency config for backward compatibility
import { getCurrencySymbol, CURRENCIES } from "@/config/currencies";

export const currencySymbols: Record<string, string> = Object.fromEntries(
    CURRENCIES.map((c) => [c.code, c.symbol]),
);

export const currencyNames: Record<string, string> = Object.fromEntries(
    CURRENCIES.map((c) => [c.code, c.name]),
);

// Helper function
export { getCurrencySymbol };
