import { EnvironmentConfig } from "../lib/shared/types.js";

export const prodConfig: EnvironmentConfig = {
    projectNamePrefix: "onething-invoice-prod",
    domainName: "makeinvoices.app",
    hostedZoneName: "makeinvoices.app",
    alertEmail: "contact@makeinvoices.app",
    account: "350610702366",
    region: "eu-west-1",
    certificateRegion: "us-east-1",
    crossRegionReferences: true,
    certificateStackDescription: "onething-invoice-prod Certificate Stack (us-east-1)",
    mainStackDescription: "onething-invoice-prod Main Stack",
    monitoringThresholds: {
        api4xxErrors: 5,
        api5xxErrors: 5,
        apiLatency: 2000,
        apiLatencyEvaluationPeriods: 1,
        cognitoAuthFailures: 5,
        cognitoThrottles: 15,
    },
};
