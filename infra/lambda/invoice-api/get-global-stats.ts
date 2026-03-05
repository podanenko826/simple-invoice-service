import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse } from "./utils";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * GET /stats (public endpoint - no auth required)
 * Get global statistics like total invoice count
 */
export async function handler(event: any) {
    console.log("Event:", JSON.stringify(event, null, 2));

    try {
        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                userId: "GLOBAL",
                itemId: "STATS",
            },
        });

        const result = await docClient.send(command);

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
        console.error("Error:", error);
        return createResponse(500, { error: "Failed to fetch global stats" });
    }
}
