// Test utility to create a simple base64 logo for testing
export const createTestLogo = (): string => {
    // Create a simple SVG logo as base64
    const svg = `
        <svg width="100" height="60" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="60" fill="#3b82f6" rx="8"/>
            <text x="50" y="35" font-family="Arial, sans-serif" font-size="14" 
                  fill="white" text-anchor="middle" font-weight="bold">LOGO</text>
        </svg>
    `;

    // Convert SVG to base64 data URL
    const base64 = btoa(svg);
    return `data:image/svg+xml;base64,${base64}`;
};

// Test utility to validate base64 image
export const isValidBase64Image = (dataUrl: string): boolean => {
    if (!dataUrl.startsWith("data:image/")) {
        return false;
    }

    try {
        const base64Part = dataUrl.split(",")[1];
        if (!base64Part) return false;

        // Try to decode base64
        atob(base64Part);
        return true;
    } catch {
        return false;
    }
};
