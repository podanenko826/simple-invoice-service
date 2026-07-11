import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SNSClient } from "@aws-sdk/client-sns";
import { createResponse } from "./utils.js";
import { getTemplate, saveTemplate } from "./routes/templates.js";
import { listInvoices, getInvoice, saveInvoice, deleteInvoice } from "./routes/invoices.js";
import { getUsage, getGlobalStats } from "./routes/stats.js";
import { saveFeedback } from "./routes/feedback.js";

// Shared clients — initialized once, reused across invocations
const ddbClient = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(ddbClient);
export const s3Client = new S3Client({});
export const snsClient = new SNSClient({});

// Environment variables
export const TABLE_NAME = process.env.TABLE_NAME!;
export const BUCKET_NAME = process.env.BUCKET_NAME!;
export const FEEDBACK_BUCKET = process.env.FEEDBACK_BUCKET!;
export const FEEDBACK_TOPIC_ARN = process.env.FEEDBACK_TOPIC_ARN || "";

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    console.log("Event:", JSON.stringify(event, null, 2));

    const method = event.httpMethod;
    const resource = event.resource;
    const route = `${method} ${resource}`;

    try {
        switch (route) {
            // Templates
            case "GET /templates":
                return await getTemplate(event);
            case "POST /templates":
                return await saveTemplate(event);

            // Invoices
            case "GET /invoices":
                return await listInvoices(event);
            case "GET /invoices/{invoiceId}":
                return await getInvoice(event);
            case "POST /invoices":
                return await saveInvoice(event);
            case "DELETE /invoices/{invoiceId}":
                return await deleteInvoice(event);

            // Usage & Stats
            case "GET /usage":
                return await getUsage(event);
            case "GET /stats":
                return await getGlobalStats(event);

            // Feedback
            case "POST /feedback":
                return await saveFeedback(event);

            default:
                return createResponse(404, { error: `Not found: ${route}` });
        }
    } catch (error: any) {
        console.error("Unhandled error:", error);
        return createResponse(500, { error: "Internal server error" });
    }
}
