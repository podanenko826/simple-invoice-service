import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse, getUserIdFromEvent, validateRequired } from "./utils";
import { InvoiceTemplate, DynamoDBItem } from "./types";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * POST /templates
 * Save/update user's invoice template
 */
export async function handler(event: any) {
    console.log("Event:", JSON.stringify(event, null, 2));

    try {
        const userId = getUserIdFromEvent(event);
        const template: InvoiceTemplate = JSON.parse(event.body);

        // Validate required fields
        validateRequired(template, ["companyName", "currency"]);

        const now = new Date().toISOString();
        const item: DynamoDBItem = {
            userId,
            itemId: "TEMPLATE#default",
            itemType: "TEMPLATE",
            data: template,
            createdAt: now,
            updatedAt: now,
            GSI1PK: `${userId}#TEMPLATE`,
            GSI1SK: now,
        };

        const command = new PutCommand({
            TableName: TABLE_NAME,
            Item: item,
        });

        await docClient.send(command);

        return createResponse(200, {
            message: "Template saved successfully",
            data: template,
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
