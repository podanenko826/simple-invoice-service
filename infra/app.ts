#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InvoiceServiceStack } from "./stacks/invoice-service-stack.js";
import { CertificatesStack } from "./stacks/invoice-service-us-east-1.js";

const app = new cdk.App();

const account = "350610702366";
const domainName = "makeinvoices.app";
// const alertEmail = "your-email@example.com"; // TODO: Update with your email for monitoring alerts

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

// Create certificate stack in us-east-1 (required for CloudFront)
const certStack = new CertificatesStack(app, "CertificatesStack", {
    env: {
        account: account,
        region: "us-east-1", // CloudFront requires certificates in us-east-1
    },
    crossRegionReferences: true,
    domainName: domainName,
    hostedZoneName: domainName,
    description: "ACM Certificate for CloudFront distribution",
});

// Create main stack in eu-west-1 (includes monitoring construct)
const mainStack = new InvoiceServiceStack(app, "InvoiceServiceStack", {
    env: {
        account: account,
        region: "eu-west-1",
    },
    crossRegionReferences: true,
    certificateArn: certStack.certificateArn,
    domainName: domainName,
    // alertEmail: alertEmail, // Monitoring alerts will be sent to this email
    // monitoringThresholds: monitoringThresholds, // Uncomment to use custom thresholds
    description: "Simple Invoice Service Infrastructure",
});

// Ensure certificate is created before main stack
mainStack.addDependency(certStack);

app.synth();
