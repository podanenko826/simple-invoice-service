import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../handler.js";
import { createResponse, getUserIdFromEvent, validateRequired } from "../utils.js";
import { InvoiceTemplate, DynamoDBItem } from "../types.js";

/**
 * GET /templates
 * Get user's invoice template
 */
export async function getTemplate(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserIdFromEvent(event);

        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    userId,
                    itemId: "TEMPLATE#default",
                },
            })
        );

        if (!result.Item) {
            return createResponse(404, { error: "Template not found" });
        }

        return createResponse(200, result.Item.data);
    } catch (error: any) {
        console.error("Error getting template:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}

/**
 * POST /templates
 * Save/update user's invoice template
 */
export async function saveTemplate(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserIdFromEvent(event);
        const template: InvoiceTemplate = JSON.parse(event.body!);

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

        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: item,
            })
        );

        return createResponse(200, {
            message: "Template saved successfully",
            data: template,
        });
    } catch (error: any) {
        console.error("Error saving template:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        if (error.message.includes("Missing required")) {
            return createResponse(400, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}
