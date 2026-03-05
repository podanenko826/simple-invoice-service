import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse, getUserIdFromEvent, validateRequired } from "./utils";
import { Invoice, DynamoDBItem } from "./types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * POST /invoices
 * Save new invoice and track usage
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

        // Save invoice
        const saveCommand = new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        });

        await docClient.send(saveCommand);

        // Increment user usage counter
        const usageCommand = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                userId,
                itemId: "USAGE#STATS",
            },
            UpdateExpression:
                "SET itemType = :itemType, invoiceCount = if_not_exists(invoiceCount, :zero) + :inc, lastInvoiceDate = :now, updatedAt = :now",
            ExpressionAttributeValues: {
                ":itemType": "USAGE",
                ":zero": 0,
                ":inc": 1,
                ":now": now,
            },
            ReturnValues: "ALL_NEW",
        });

        const usageResult = await docClient.send(usageCommand);
        const invoiceCount = usageResult.Attributes?.invoiceCount || 1;

        // Increment global counter (for public stats)
        const globalCounterCommand = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                userId: "GLOBAL",
                itemId: "STATS",
            },
            UpdateExpression:
                "SET itemType = :itemType, totalInvoices = if_not_exists(totalInvoices, :zero) + :inc, lastUpdated = :now",
            ExpressionAttributeValues: {
                ":itemType": "GLOBAL_STATS",
                ":zero": 0,
                ":inc": 1,
                ":now": now,
            },
        });

        // Fire and forget - don't wait for global counter
        docClient.send(globalCounterCommand).catch(err => 
            console.error("Failed to update global counter:", err)
        );

        return createResponse(201, {
            message: "Invoice saved successfully",
            id: invoice.invoiceNumber,
            data: invoice,
            usage: {
                invoiceCount,
                lastInvoiceDate: now,
            },
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
