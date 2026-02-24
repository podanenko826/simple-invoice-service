import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse, getUserIdFromEvent, validateRequired } from "./utils";
import { Invoice, DynamoDBItem } from "./types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * POST /invoices
 * Save new invoice
 */
export async function handler(event: any) {
    console.log("Event:", JSON.stringify(event, null, 2));

    try {
        const userId = getUserIdFromEvent(event);
        const invoice: Invoice = JSON.parse(event.body);

        // Validate required fields
        validateRequired(invoice, [
            "invoiceNumber",
            "issueDate",
            "clientName",
            "currency",
            "total",
        ]);

        const now = new Date().toISOString();
        const item: DynamoDBItem = {
            userId,
            itemId: `INVOICE#${invoice.invoiceNumber}`,
            itemType: "INVOICE",
            data: invoice,
            createdAt: now,
            updatedAt: now,
            GSI1PK: `${userId}#INVOICE`,
            GSI1SK: now,
        };

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        });

        await docClient.send(command);

        return createResponse(201, {
            message: "Invoice saved successfully",
            id: invoice.invoiceNumber,
            data: invoice,
        });
    } catch (error: any) {
        console.error("Error:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        if (error.message.includes("Missing required")) {
            return createResponse(400, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}
