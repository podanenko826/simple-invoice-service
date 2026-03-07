/**
 * Safe logging utility for Cognito trigger events
 * Redacts sensitive information before logging
 */

export function logEventSafely(event: any, logger: any): void {
    const safeEvent = {
        triggerSource: event.triggerSource,
        userName: event.userName ? "[REDACTED]" : undefined,
        userPoolId: event.userPoolId,
        region: event.region,
        request: {
            userAttributes: event.request?.userAttributes
                ? { email: "[REDACTED]", sub: event.request.userAttributes.sub }
                : undefined,
            clientMetadata: event.request?.clientMetadata
                ? {
                      signInMethod: event.request.clientMetadata.signInMethod,
                      // Redact other metadata that might contain sensitive info
                  }
                : undefined,
            sessionLength: event.request?.session?.length,
        },
        response: {
            answerCorrect: event.response?.answerCorrect,
            challengeName: event.response?.challengeName,
            issueTokens: event.response?.issueTokens,
            failAuthentication: event.response?.failAuthentication,
        },
    };

    logger.debug(
        "Cognito Event (sanitized):",
        JSON.stringify(safeEvent, null, 2)
    );
}
