import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse, getUserIdFromEvent } from "./utils";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * GET /invoices/{invoiceId}
 * Get specific invoice
 * Cacheable endpoint
 */
export async function handler(event: any) {
    console.log("Event:", JSON.stringify(event, null, 2));

    try {
        const userId = getUserIdFromEvent(event);
        const invoiceId = event.pathParameters?.invoiceId;

        if (!invoiceId) {
            return createResponse(400, { error: "Invoice ID is required" });
        }

        const command = new GetCommand({
            TableName: TABLE_NAME,
            Key: {
                userId,
                itemId: `INVOICE#${invoiceId}`,
            },
        });

        const result = await docClient.send(command);

        if (!result.Item) {
            return createResponse(404, { error: "Invoice not found" });
        }

        return createResponse(200, {
            id: invoiceId,
            ...result.Item.data,
            createdAt: result.Item.createdAt,
            pdfUrl: result.Item.pdfUrl,
        });
    } catch (error: any) {
        console.error("Error:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}
