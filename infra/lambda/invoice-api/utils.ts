import { APIResponse } from "./types";

export function createResponse(
    statusCode: number,
    body: any,
    headers: Record<string, string> = {}
): APIResponse {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            ...headers,
        },
        body: JSON.stringify(body),
    };
}

export function getUserIdFromEvent(event: any): string {
    // Extract userId from Cognito authorizer
    const claims = event.requestContext?.authorizer?.claims;
    if (!claims || !claims.sub) {
        throw new Error("Unauthorized: No user ID found");
    }
    return claims.sub;
}

export function validateRequired(data: any, fields: string[]): void {
    const missing = fields.filter((field) => {
        const value = data[field];
        return (
            value === undefined ||
            value === null ||
            value === "" ||
            (typeof value === "string" && value.trim() === "")
        );
    });
    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
}
