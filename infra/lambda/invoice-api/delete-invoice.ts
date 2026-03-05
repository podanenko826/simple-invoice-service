import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse, getUserIdFromEvent } from "./utils";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * DELETE /invoices/{invoiceId}
 * Delete invoice
 */
export async function handler(event: any) {
    console.log("Event:", JSON.stringify(event, null, 2));

    try {
        const userId = getUserIdFromEvent(event);
        const invoiceId = event.pathParameters?.invoiceId;

        if (!invoiceId) {
            return createResponse(400, { error: "Invoice ID is required" });
        }

        const command = new DeleteCommand({
            TableName: TABLE_NAME,
            Key: {
                userId,
                itemId: `INVOICE#${invoiceId}`,
            },
        });

        await docClient.send(command);

        return createResponse(200, {
            message: "Invoice deleted successfully",
            id: invoiceId,
        });
    } catch (error: any) {
        console.error("Error:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}
