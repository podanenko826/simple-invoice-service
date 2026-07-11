import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { GetCommand, PutCommand, DeleteCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "../handler.js";
import { createResponse, getUserIdFromEvent, validateRequired } from "../utils.js";
import { Invoice, DynamoDBItem } from "../types.js";

/**
 * GET /invoices
 * List all invoices for user
 */
export async function listInvoices(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserIdFromEvent(event);

        const result = await docClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression:
                    "userId = :userId AND begins_with(itemId, :prefix)",
                ExpressionAttributeValues: {
                    ":userId": userId,
                    ":prefix": "INVOICE#",
                },
            })
        );

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
        console.error("Error listing invoices:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}

/**
 * GET /invoices/{invoiceId}
 * Get specific invoice
 */
export async function getInvoice(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserIdFromEvent(event);
        const invoiceId = event.pathParameters?.invoiceId;

        if (!invoiceId) {
            return createResponse(400, { error: "Invoice ID is required" });
        }

        const result = await docClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    userId,
                    itemId: `INVOICE#${invoiceId}`,
                },
            })
        );

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
        console.error("Error getting invoice:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}

/**
 * POST /invoices
 * Save new invoice and track usage
 */
export async function saveInvoice(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserIdFromEvent(event);
        const invoice: Invoice = JSON.parse(event.body!);

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
        await docClient.send(
            new PutCommand({
                TableName: TABLE_NAME,
                Item: item,
            })
        );

        // Increment user usage counter
        const usageResult = await docClient.send(
            new UpdateCommand({
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
            })
        );

        const invoiceCount = usageResult.Attributes?.invoiceCount || 1;

        // Increment global counter (fire and forget)
        docClient
            .send(
                new UpdateCommand({
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
                })
            )
            .catch((err) => console.error("Failed to update global counter:", err));

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
        console.error("Error saving invoice:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        if (error.message.includes("Missing required")) {
            return createResponse(400, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}

/**
 * DELETE /invoices/{invoiceId}
 * Delete invoice
 */
export async function deleteInvoice(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserIdFromEvent(event);
        const invoiceId = event.pathParameters?.invoiceId;

        if (!invoiceId) {
            return createResponse(400, { error: "Invoice ID is required" });
        }

        await docClient.send(
            new DeleteCommand({
                TableName: TABLE_NAME,
                Key: {
                    userId,
                    itemId: `INVOICE#${invoiceId}`,
                },
            })
        );

        return createResponse(200, {
            message: "Invoice deleted successfully",
            id: invoiceId,
        });
    } catch (error: any) {
        console.error("Error deleting invoice:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}
