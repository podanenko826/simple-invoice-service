#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InvoiceServiceStack } from './stacks/invoice-service-stack';

const app = new cdk.App();

new InvoiceServiceStack(app, 'InvoiceServiceStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  description: 'Simple Invoice Service Infrastructure',
});

app.synth();
