import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse, getUserIdFromEvent } from "./utils";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * GET /usage
 * Get user's usage statistics
 */
export async function handler(event: any) {
    console.log("Event:", JSON.stringify(event, null, 2));

    try {
        const userId = getUserIdFromEvent(event);

        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                userId,
                itemId: "USAGE#STATS",
            },
        });

        const result = await docClient.send(command);

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
        console.error("Error:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}
