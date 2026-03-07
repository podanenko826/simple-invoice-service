import { EnvironmentConfig } from "../lib/shared/types.js";
import { ENV } from "../lib/shared/enum.js";
import { devConfig } from "../config/dev.js";
import { prodConfig } from "../config/prod.js";

export function getConfig(env: ENV): EnvironmentConfig {
    if (env === ENV.prod) {
        return prodConfig;
    }
    if (env === ENV.dev) {
        return devConfig;
    }
    throw new Error(`Unknown environment: ${env}`);
}
