import { revokeToken } from "./cognito-api.js";
import { configure } from "./config.js";
import { retrieveTokens, storeTokens } from "./storage.js";
import type {
    TokensFromRefresh,
    TokensFromSignIn,
    BusyState,
    IdleState,
} from "./model.js";
import { busyState } from "./model.js";
import { scheduleRefresh } from "./refresh.js";

/** The default tokens callback stores tokens in storage and reschedules token refresh */
export const defaultTokensCb = async ({
    tokens,
    abort,
}: {
    tokens: TokensFromSignIn | TokensFromRefresh;
    abort?: AbortSignal;
}) => {
    const storeAndScheduleRefresh = async (
        tokens: TokensFromSignIn | TokensFromRefresh,
    ) => {
        await storeTokens(tokens);
        scheduleRefresh({
            abort,
            tokensCb: (newTokens) => {
                if (newTokens) {
                    return storeAndScheduleRefresh({ ...tokens, ...newTokens });
                }
            },
        }).catch((err: unknown) => {
            const { debug } = configure();
            debug?.("Failed to store and refresh tokens:", err);
        });
    };
    await storeAndScheduleRefresh(tokens);
};

/**
 * Sign the user out. This means: clear tokens from storage,
 * and revoke the refresh token from Amazon Cognito
 */
export const signOut = (props?: {
    currentStatus?: BusyState | IdleState;
    tokensRemovedLocallyCb?: () => void;
    statusCb?: (status: BusyState | IdleState) => void;
}) => {
    const { clientId, debug, storage } = configure();
    const { currentStatus, statusCb } = props ?? {};
    if (currentStatus && busyState.includes(currentStatus as BusyState)) {
        debug?.(
            `Initiating sign-out despite being in a busy state: ${currentStatus}`,
        );
    }
    statusCb?.("SIGNING_OUT");
    const abort = new AbortController();
    const signedOut = (async () => {
        try {
            const tokens = await retrieveTokens();
            if (abort.signal.aborted) {
                debug?.("Aborting sign-out");
                if (currentStatus) {
                    statusCb?.(currentStatus);
                }
                return;
            }
            if (!tokens) {
                debug?.("No tokens in storage to delete");
                props?.tokensRemovedLocallyCb?.();
                statusCb?.("SIGNED_OUT");
                return;
            }
            const amplifyKeyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
            const customKeyPrefix = `Passwordless.${clientId}`;
            await Promise.all([
                storage.removeItem(
                    `${amplifyKeyPrefix}.${tokens.username}.idToken`,
                ),
                storage.removeItem(
                    `${amplifyKeyPrefix}.${tokens.username}.accessToken`,
                ),
                storage.removeItem(
                    `${amplifyKeyPrefix}.${tokens.username}.refreshToken`,
                ),
                storage.removeItem(
                    `${amplifyKeyPrefix}.${tokens.username}.tokenScopesString`,
                ),
                storage.removeItem(
                    `${amplifyKeyPrefix}.${tokens.username}.userData`,
                ),
                storage.removeItem(`${amplifyKeyPrefix}.LastAuthUser`),
                storage.removeItem(
                    `${customKeyPrefix}.${tokens.username}.expireAt`,
                ),
                storage.removeItem(
                    `Passwordless.${clientId}.${tokens.username}.refreshingTokens`,
                ),
            ]);
            props?.tokensRemovedLocallyCb?.();
            if (tokens.refreshToken) {
                await revokeToken({
                    abort: undefined, // if we've come this far, let this proceed
                    refreshToken: tokens.refreshToken,
                });
            }
            statusCb?.("SIGNED_OUT");
        } catch (err) {
            if (abort.signal.aborted) return;
            if (currentStatus) {
                statusCb?.(currentStatus);
            }
            throw err;
        }
    })();
    return {
        signedOut,
        abort: () => abort.abort(),
    };
};
