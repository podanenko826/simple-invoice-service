#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InvoiceServiceStack } from "../lib/stacks/invoice-service-stack.js";
import { CertificatesStack } from "../lib/stacks/invoice-service-us-east-1.js";
import { getConfig } from "./config.js";
import { ENV } from "../lib/shared/enum.js";

const app = new cdk.App();

// Load environment configuration
const environmentString = process.env.DEPLOY_ENV;
if (environmentString !== "dev" && environmentString !== "prod") {
    throw new Error("Invalid environment. Please set DEPLOY_ENV to 'dev' or 'prod'.");
}
const environment = environmentString as ENV;
const config = getConfig(environment);

const configDefault = {
    env: {
        account: "350610702366",
        region: "eu-west-1"
    },
    config: config,
    environment: environment,
};

const configUsEast1 = {
    env: {
        account: "350610702366",
        region: "us-east-1"
    },
    config: config,
    domainName: config.domainName,
    hostedZoneName: config.hostedZoneName,
};

// Create certificate stack in us-east-1 (required for CloudFront)
const certStack = new CertificatesStack(app, `${config.projectNamePrefix}-CertificatesStack`, {
    ...configUsEast1,
    description: config.certificateStackDescription
});

// Add tags to certificate stack
cdk.Tags.of(certStack).add("Environment", environment);
cdk.Tags.of(certStack).add("StackName", `${config.projectNamePrefix}-CertificatesStack`);

// Create main stack in eu-west-1 (includes monitoring construct)
const mainStack = new InvoiceServiceStack(app, `${config.projectNamePrefix}-InvoiceServiceStack`, {
    ...configDefault,
    crossRegionReferences: true,
    certificateArn: certStack.certificateArn,
    description: config.mainStackDescription
});

// Add tags to main stack
cdk.Tags.of(mainStack).add("Environment", environment);
cdk.Tags.of(mainStack).add("StackName", `${config.projectNamePrefix}-InvoiceServiceStack`);

// Ensure certificate is created before main stack
mainStack.addDependency(certStack);

app.synth();
