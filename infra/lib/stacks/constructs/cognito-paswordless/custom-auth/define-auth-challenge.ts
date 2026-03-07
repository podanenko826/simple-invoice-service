import {
    DefineAuthChallengeTriggerHandler,
    DefineAuthChallengeTriggerEvent,
} from "aws-lambda";
import { logger } from "./common.js";
import { logEventSafely } from "./safe-logger.js";

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
    logEventSafely(event, logger);

    if (!event.request.session.length) {
        // The auth flow just started, send a custom challenge
        logger.info("No session yet, starting one ...");
        return customChallenge(event);
    }

    // We only accept custom challenges
    if (
        event.request.session.find(
            (attempt) => attempt.challengeName !== "CUSTOM_CHALLENGE"
        )
    ) {
        return deny(event, "Expected CUSTOM_CHALLENGE");
    }

    const { signInMethod } = event.request.clientMetadata ?? {};
    logger.info(
        `Requested signInMethod: ${signInMethod} (attempt: ${countAttempts(event)})`
    );

    if (signInMethod === "MAGIC_LINK") {
        return handleMagicLinkResponse(event);
    }

    return deny(event, `Unrecognized signInMethod: ${signInMethod}`);
};

function handleMagicLinkResponse(event: DefineAuthChallengeTriggerEvent) {
    logger.info("Checking Magic Link Auth ...");
    const { alreadyHaveMagicLink } = event.request.clientMetadata ?? {};
    const lastResponse = event.request.session.slice(-1)[0];
    if (lastResponse.challengeResult === true) {
        return allow(event);
    } else if (alreadyHaveMagicLink !== "yes" && countAttempts(event) === 0) {
        logger.info("No magic link yet, creating one");
        return customChallenge(event);
    }
    return deny(event, "Failed to authenticate with Magic Link");
}

function deny(event: DefineAuthChallengeTriggerEvent, reason: string) {
    logger.info("Failing authentication because:", reason);
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
    return event;
}

function allow(event: DefineAuthChallengeTriggerEvent) {
    logger.info("Authentication successful");
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
    return event;
}

function customChallenge(event: DefineAuthChallengeTriggerEvent) {
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    event.response.challengeName = "CUSTOM_CHALLENGE";
    logger.info("Next step: CUSTOM_CHALLENGE");
    return event;
}

function countAttempts(
    event: DefineAuthChallengeTriggerEvent,
    excludeProvideAuthParameters = true
) {
    if (!excludeProvideAuthParameters) return event.request.session.length;
    return event.request.session.filter(
        (entry) => entry.challengeMetadata !== "PROVIDE_AUTH_PARAMETERS"
    ).length;
}
