import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME!;

/**
 * GET /stats/global (public endpoint)
 * Get global usage statistics for social proof
 */
export const handler = async () => {
    try {
        // Scan for all USAGE#STATS items
        const result = await docClient.send(
            new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "itemId = :itemId",
                ExpressionAttributeValues: {
                    ":itemId": "USAGE#STATS",
                },
                ProjectionExpression: "invoiceCount",
            })
        );

        const totalInvoices = (result.Items || []).reduce(
            (sum, item) => sum + (item.invoiceCount || 0),
            0
        );

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET,OPTIONS",
            },
            body: JSON.stringify({
                totalInvoices,
                lastUpdated: new Date().toISOString(),
            }),
        };
    } catch (error) {
        console.error("Error fetching global stats:", error);
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Failed to fetch global stats" }),
        };
    }
};
