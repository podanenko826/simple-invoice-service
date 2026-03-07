import { EnvironmentConfig } from "../lib/shared/types.js";

export const devConfig: EnvironmentConfig = {
    projectNamePrefix: "onething-invoice-dev",
    domainName: "makeinvoices.app",
    hostedZoneName: "makeinvoices.app",
    alertEmail: "contact@makeinvoices.app",
    account: "350610702366",
    region: "eu-west-1",
    certificateRegion: "us-east-1",
    crossRegionReferences: true,
    certificateStackDescription: "onething-invoice-dev Certificate Stack (us-east-1)",
    mainStackDescription: "onething-invoice-dev Main Stack",
};
