import { VerifyAuthChallengeResponseTriggerHandler } from "aws-lambda";
import * as magicLink from "./magic-link.js";
import { logger, UserFacingError } from "./common.js";

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (
    event
) => {
    logger.debug(JSON.stringify(event, null, 2));
    try {
        event.response.answerCorrect = false;

        // Verify challenge answer
        if (event.request.clientMetadata?.signInMethod === "MAGIC_LINK") {
            await magicLink.addChallengeVerificationResultToEvent(event);
        }
        // Return event
        logger.debug(JSON.stringify(event, null, 2));
        logger.info(
            "Verification result, answerCorrect:",
            event.response.answerCorrect
        );
        return event;
    } catch (err: unknown) {
        logger.error(err);
        if (err instanceof UserFacingError) {
            throw err;
        }
        throw new Error("Internal Server Error", { cause: err });
    }
};
