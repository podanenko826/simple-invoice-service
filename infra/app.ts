#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { InvoiceServiceStack } from "./stacks/invoice-service-stack.js";

const app = new cdk.App();

new InvoiceServiceStack(app, "InvoiceServiceStack", {
    env: {
        account: "350610702366",
        region: "eu-west-1",
    },
    description: "Simple Invoice Service Infrastructure",
});

app.synth();
