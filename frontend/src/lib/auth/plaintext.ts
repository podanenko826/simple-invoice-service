import { configure } from "./config.js";
import type { IdleState, BusyState, TokensFromSignIn } from "./model.js";
import { initiateAuth, handleAuthResponse } from "./cognito-api.js";
import { defaultTokensCb } from "./common.js";

export function authenticateWithPlaintextPassword({
    username,
    password,
    smsMfaCode,
    otpMfaCode,
    newPassword,
    tokensCb,
    statusCb,
    clientMetadata,
}: {
    /**
     * Username, or alias (e-mail, phone number)
     */
    username: string;
    password: string;
    smsMfaCode?: () => Promise<string>;
    otpMfaCode?: () => Promise<string>;
    newPassword?: () => Promise<string>;
    tokensCb?: (tokens: TokensFromSignIn) => void | Promise<void>;
    statusCb?: (status: BusyState | IdleState) => void;
    currentStatus?: BusyState | IdleState;
    clientMetadata?: Record<string, string>;
}) {
    const { userPoolId, debug } = configure();
    if (!userPoolId) {
        throw new Error("UserPoolId must be configured");
    }
    const abort = new AbortController();
    const signedIn = (async () => {
        try {
            statusCb?.("SIGNING_IN_WITH_PASSWORD");
            debug?.(`Invoking initiateAuth ...`);
            const authResponse = await initiateAuth({
                authflow: "USER_PASSWORD_AUTH",
                authParameters: { USERNAME: username, PASSWORD: password },
                clientMetadata,
            });
            debug?.(`Response from initiateAuth:`, authResponse);
            const tokens = await handleAuthResponse({
                authResponse,
                username,
                smsMfaCode,
                otpMfaCode,
                newPassword,
                clientMetadata,
                abort: abort.signal,
            });
            if (tokensCb) {
                await tokensCb(tokens);
            } else {
                await defaultTokensCb({ tokens, abort: abort.signal });
            }
            statusCb?.("SIGNED_IN_WITH_PASSWORD");
        } catch (err) {
            statusCb?.("PASSWORD_SIGNIN_FAILED");
            throw err;
        }
    })();
    return {
        signedIn: signedIn,
        abort: () => abort.abort(),
    };
}
