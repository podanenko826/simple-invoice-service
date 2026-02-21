import { parseJwtPayload } from "./utils.js";
import { configure } from "./config.js";
import type {
    CognitoIdTokenPayload,
    CognitoAccessTokenPayload,
} from "./jwt-model.js";

export interface TokensToStore {
    accessToken: string;
    idToken: string;
    refreshToken?: string;
    expireAt: Date;
}
export interface TokensFromStorage {
    accessToken?: string;
    idToken?: string;
    refreshToken?: string;
    expireAt?: Date;
    username: string;
}

export async function storeTokens(tokens: TokensToStore) {
    const { clientId, storage } = configure();
    const {
        sub,
        email,
        "cognito:username": username,
    } = parseJwtPayload<CognitoIdTokenPayload>(tokens.idToken);
    const { scope } = parseJwtPayload<CognitoAccessTokenPayload>(
        tokens.accessToken,
    );
    const amplifyKeyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
    const customKeyPrefix = `Passwordless.${clientId}`;

    const promises: (void | Promise<void>)[] = [];
    promises.push(
        storage.setItem(`${amplifyKeyPrefix}.LastAuthUser`, username),
    );
    promises.push(
        storage.setItem(
            `${amplifyKeyPrefix}.${username}.idToken`,
            tokens.idToken,
        ),
    );
    promises.push(
        storage.setItem(
            `${amplifyKeyPrefix}.${username}.accessToken`,
            tokens.accessToken,
        ),
    );
    if (tokens.refreshToken) {
        promises.push(
            storage.setItem(
                `${amplifyKeyPrefix}.${username}.refreshToken`,
                tokens.refreshToken,
            ),
        );
    }
    promises.push(
        storage.setItem(
            `${amplifyKeyPrefix}.${username}.userData`,
            JSON.stringify({
                UserAttributes: [
                    {
                        Name: "sub",
                        Value: sub,
                    },
                    {
                        Name: "email",
                        Value: email,
                    },
                ],
                Username: username,
            }),
        ),
    );
    promises.push(
        storage.setItem(
            `${amplifyKeyPrefix}.${username}.tokenScopesString`,
            scope,
        ),
    );
    promises.push(
        storage.setItem(
            `${customKeyPrefix}.${username}.expireAt`,
            tokens.expireAt.toISOString(),
        ),
    );
    await Promise.all(promises.filter((p) => !!p));
}

export async function retrieveTokens(): Promise<TokensFromStorage | undefined> {
    const { clientId, storage } = configure();
    const amplifyKeyPrefix = `CognitoIdentityServiceProvider.${clientId}`;
    const customKeyPrefix = `Passwordless.${clientId}`;
    const username = await storage.getItem(`${amplifyKeyPrefix}.LastAuthUser`);
    if (!username) {
        return;
    }
    const [accessToken, idToken, refreshToken, expireAt] = await Promise.all([
        storage.getItem(`${amplifyKeyPrefix}.${username}.accessToken`),
        storage.getItem(`${amplifyKeyPrefix}.${username}.idToken`),
        storage.getItem(`${amplifyKeyPrefix}.${username}.refreshToken`),
        storage.getItem(`${customKeyPrefix}.${username}.expireAt`),
    ]);
    return {
        idToken: idToken ?? undefined,
        accessToken: accessToken ?? undefined,
        refreshToken: refreshToken ?? undefined,
        expireAt: expireAt ? new Date(expireAt) : undefined,
        username,
    };
}
