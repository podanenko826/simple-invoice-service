import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { createResponse, getUserIdFromEvent } from "./utils";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * GET /invoices
 * List all invoices for user
 * Cacheable endpoint
 */
export async function handler(event: any) {
    console.log("Event:", JSON.stringify(event, null, 2));

    try {
        const userId = getUserIdFromEvent(event);

        const command = new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression:
                "userId = :userId AND begins_with(itemId, :prefix)",
            ExpressionAttributeValues: {
                ":userId": userId,
                ":prefix": "INVOICE#",
            },
        });
        const result = await docClient.send(command);
        const invoices = (result.Items || [])
            .sort((a, b) => {
                const aCreated = a.createdAt ?? "";
                const bCreated = b.createdAt ?? "";
                return bCreated.localeCompare(aCreated);
            })
            .map((item) => ({
                id: item.itemId.replace("INVOICE#", ""),
                ...item.data,
                createdAt: item.createdAt,
                pdfUrl: item.pdfUrl,
            }));

        return createResponse(200, invoices);
    } catch (error: any) {
        console.error("Error:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}
