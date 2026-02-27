#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InvoiceServiceStack } from "./stacks/invoice-service-stack.js";
import { CertificatesStack } from "./stacks/invoice-service-us-east-1.js";

const app = new cdk.App();

const account = "350610702366";
const domainName = "makeinvoices.app";

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

// Create main stack in eu-west-1
const mainStack = new InvoiceServiceStack(app, "InvoiceServiceStack", {
    env: {
        account: account,
        region: "eu-west-1",
    },
    crossRegionReferences: true,
    certificateArn: certStack.certificateArn,
    domainName: domainName,
    description: "Simple Invoice Service Infrastructure",
});

// Ensure certificate is created before main stack
mainStack.addDependency(certStack);

app.synth();
