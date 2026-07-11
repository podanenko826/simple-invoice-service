import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../handler.js";
import { createResponse, getUserIdFromEvent } from "../utils.js";

/**
 * GET /usage
 * Get user's usage statistics
 */
export async function getUsage(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserIdFromEvent(event);

        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    userId,
                    itemId: "USAGE#STATS",
                },
            })
        );

        if (!result.Item) {
            return createResponse(200, {
                invoiceCount: 0,
                lastInvoiceDate: null,
            });
        }

        return createResponse(200, {
            invoiceCount: result.Item.invoiceCount || 0,
            lastInvoiceDate: result.Item.lastInvoiceDate || null,
            updatedAt: result.Item.updatedAt || null,
        });
    } catch (error: any) {
        console.error("Error getting usage:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}

/**
 * GET /stats (public endpoint - no auth required)
 * Get global statistics like total invoice count
 */
export async function getGlobalStats(_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    userId: "GLOBAL",
                    itemId: "STATS",
                },
            })
        );

        if (!result.Item) {
            return createResponse(200, {
                totalInvoices: 0,
                lastUpdated: null,
            });
        }

        return createResponse(200, {
            totalInvoices: result.Item.totalInvoices || 0,
            lastUpdated: result.Item.lastUpdated || null,
        });
    } catch (error: any) {
        console.error("Error getting global stats:", error);
        return createResponse(500, { error: "Failed to fetch global stats" });
    }
}
