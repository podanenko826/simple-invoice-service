import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PublishCommand } from "@aws-sdk/client-sns";
import { s3Client, snsClient, FEEDBACK_BUCKET, FEEDBACK_TOPIC_ARN } from "../handler.js";
import { createResponse, getUserIdFromEvent } from "../utils.js";

interface FeedbackRequest {
    message: string;
    rating?: number;
    page?: string;
}

/**
 * POST /feedback
 * Save user feedback to S3 and notify via SNS
 */
export async function saveFeedback(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
        const userId = getUserIdFromEvent(event);
        const feedback: FeedbackRequest = JSON.parse(event.body!);

        if (!feedback.message || !feedback.message.trim()) {
            return createResponse(400, {
                error: "Feedback message is required",
            });
        }

        const timestamp = new Date().toISOString();
        const feedbackId = `${timestamp.replace(/[:.]/g, "-")}-${userId.substring(0, 8)}`;

        const feedbackData = {
            feedbackId,
            userId,
            message: feedback.message.trim(),
            rating: feedback.rating,
            page: feedback.page,
            timestamp,
            userAgent: event.requestContext?.identity?.userAgent,
            sourceIp: event.requestContext?.identity?.sourceIp,
        };

        // Save to S3
        const key = `feedback/${timestamp.split("T")[0]}/${feedbackId}.json`;

        await s3Client.send(
            new PutObjectCommand({
                Bucket: FEEDBACK_BUCKET,
                Key: key,
                Body: JSON.stringify(feedbackData, null, 2),
                ContentType: "application/json",
                Metadata: {
                    userId,
                    timestamp,
                },
            })
        );

        console.log(`Feedback saved: ${key}`);

        // Send SNS notification if topic ARN is configured
        if (FEEDBACK_TOPIC_ARN) {
            try {
                const emailSubject = `New Feedback: ${feedback.rating ? `⭐ ${feedback.rating}/5` : "No rating"}`;
                const emailBody = `
New feedback received from OneThing Invoice!

📝 Message:
${feedback.message}

${feedback.rating ? `⭐ Rating: ${feedback.rating}/5` : ""}
${feedback.page ? `📄 Page: ${feedback.page}` : ""}

👤 User ID: ${userId}
🕐 Timestamp: ${timestamp}
🌐 User Agent: ${feedbackData.userAgent || "N/A"}
📍 Source IP: ${feedbackData.sourceIp || "N/A"}

📦 S3 Location: s3://${FEEDBACK_BUCKET}/${key}
                `.trim();

                await snsClient.send(
                    new PublishCommand({
                        TopicArn: FEEDBACK_TOPIC_ARN,
                        Subject: emailSubject,
                        Message: emailBody,
                    })
                );
                console.log("SNS notification sent successfully");
            } catch (snsError) {
                console.error("Failed to send SNS notification:", snsError);
                // Don't fail the request if SNS fails
            }
        }

        return createResponse(201, {
            message: "Feedback saved successfully",
            feedbackId,
        });
    } catch (error: any) {
        console.error("Error saving feedback:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}
