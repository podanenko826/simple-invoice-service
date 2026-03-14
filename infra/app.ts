#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InvoiceServiceStack } from "./stacks/invoice-service-stack.js";
import { CertificatesStack } from "./stacks/invoice-service-us-east-1.js";

const app = new cdk.App();

// Environment configuration
const environment = process.env.ENVIRONMENT || "dev";
const account = "350610702366";

const envConfig = {
    dev: {
        domainName: "makeinvoices.app", // No custom domain for dev
        alertEmail: "dev@makeinvoices.app",
        region: "eu-west-1",
    },
    staging: {
        domainName: "staging.makeinvoices.app",
        alertEmail: "staging@makeinvoices.app",
        region: "eu-west-1",
    },
    prod: {
        domainName: "makeinvoices.dev.app",
        alertEmail: "contact@makeinvoices.app",
        region: "eu-west-1",
    },
} as const;

type Environment = keyof typeof envConfig;
const config = envConfig[environment as Environment];

if (!config) {
    throw new Error(
        `Unknown environment: ${environment}. Valid environments: ${Object.keys(envConfig).join(", ")}`
    );
}

// Optional: Customize monitoring thresholds
// Uncomment and adjust values as needed
// const monitoringThresholds = {
//     api4xxErrors: 20,              // Default: 10
//     api5xxErrors: 10,              // Default: 5
//     apiLatency: 5000,              // Default: 3000 (ms)
//     apiLatencyEvaluationPeriods: 3, // Default: 2
//     cognitoAuthFailures: 15,       // Default: 10
//     cognitoThrottles: 10,          // Default: 5
// };

// Create certificate stack in us-east-1 (required for CloudFront) - only for environments with custom domains
let certStack: CertificatesStack | undefined;
if (config.domainName) {
    certStack = new CertificatesStack(app, `CertificatesStack-${environment}`, {
        env: {
            account: account,
            region: "us-east-1", // CloudFront requires certificates in us-east-1
        },
        crossRegionReferences: true,
        domainName: config.domainName,
        hostedZoneName: config.domainName,
        description: `ACM Certificate for CloudFront distribution - ${environment}`,
    });
}

// Create main stack
const mainStack = new InvoiceServiceStack(
    app,
    `InvoiceServiceStack-${environment}`,
    {
        env: {
            account: account,
            region: config.region,
        },
        crossRegionReferences: true,
        certificateArn: certStack?.certificateArn,
        domainName: config.domainName,
        alertEmail: config.alertEmail,
        environment: environment, // Pass environment to stack
        // monitoringThresholds: monitoringThresholds, // Uncomment to use custom thresholds
        description: `Simple Invoice Service Infrastructure - ${environment}`,
    }
);

// Ensure certificate is created before main stack (if certificate exists)
if (certStack) {
    mainStack.addDependency(certStack);
}

app.synth();
