import { PreSignUpTriggerHandler, PreSignUpTriggerEvent } from "aws-lambda";
import { logger } from "./common.js";
import { logEventSafely } from "./safe-logger.js";

export const handler: PreSignUpTriggerHandler = async (
    event: PreSignUpTriggerEvent
) => {
    logger.info("Pre-signup: auto confirming user ...");
    logEventSafely(event, logger);
    event.response.autoConfirmUser = true;
    return event;
};
