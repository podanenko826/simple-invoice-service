import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { createResponse, getUserIdFromEvent } from "./utils";

const s3Client = new S3Client({});
const FEEDBACK_BUCKET = process.env.FEEDBACK_BUCKET!;

interface FeedbackRequest {
    message: string;
    rating?: number;
    page?: string;
}

/**
 * POST /feedback
 * Save user feedback to S3
 */
export async function handler(event: any) {
    console.log("Event:", JSON.stringify(event, null, 2));

    try {
        const userId = getUserIdFromEvent(event);
        const feedback: FeedbackRequest = JSON.parse(event.body);

        if (!feedback.message || !feedback.message.trim()) {
            return createResponse(400, {
                error: "Feedback message is required",
            });
        }

        const timestamp = new Date().toISOString();
        const feedbackId = `${timestamp.replace(/[:.]/g, "-")}-${userId.substring(0, 8)}`;

        // Create feedback object with metadata
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

        // Save to S3 as JSON
        const key = `feedback/${timestamp.split("T")[0]}/${feedbackId}.json`;

        const command = new PutObjectCommand({
            Bucket: FEEDBACK_BUCKET,
            Key: key,
            Body: JSON.stringify(feedbackData, null, 2),
            ContentType: "application/json",
            Metadata: {
                userId,
                timestamp,
            },
        });

        await s3Client.send(command);

        console.log(`Feedback saved: ${key}`);

        return createResponse(201, {
            message: "Feedback saved successfully",
            feedbackId,
        });
    } catch (error: any) {
        console.error("Error:", error);
        if (error.message.includes("Unauthorized")) {
            return createResponse(401, { error: error.message });
        }
        return createResponse(500, { error: error.message });
    }
}
