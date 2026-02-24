export interface Currency {
    code: string;
    symbol: string;
    name: string;
}

export const CURRENCIES: Currency[] = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "UAH", symbol: "₴", name: "Ukrainian Hryvnia" },
];

export const DEFAULT_CURRENCY = "USD";

// Helper function to get currency symbol by code
export const getCurrencySymbol = (code: string): string => {
    const currency = CURRENCIES.find((c) => c.code === code);
    return currency?.symbol || code;
};

// Helper function to get currency by code
export const getCurrency = (code: string): Currency | undefined => {
    return CURRENCIES.find((c) => c.code === code);
};

// Helper function to get all currency codes
export const getCurrencyCodes = (): string[] => {
    return CURRENCIES.map((c) => c.code);
};
