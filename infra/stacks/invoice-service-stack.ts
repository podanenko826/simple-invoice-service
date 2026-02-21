import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { Passwordless } from "./constructs/cognito-paswordless/cognito-paswordless.js";

export class InvoiceServiceStack extends cdk.Stack {
    public readonly invoiceBucket: s3.Bucket;
    public readonly templateTable: dynamodb.Table;
    public readonly auth: Passwordless;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const projectNamePrfix = "sis";
        const environment = "dev";
        const removalPolicy =
            environment === "dev"
                ? cdk.RemovalPolicy.DESTROY
                : cdk.RemovalPolicy.RETAIN;
        const { account } = cdk.Stack.of(this);

        // S3 Bucket for storing invoice PDFs
        this.invoiceBucket = new s3.Bucket(this, "InvoiceBucket", {
            bucketName: `${projectNamePrfix}-invoice-pdfs-${account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            versioned: true,
            removalPolicy: removalPolicy,
            autoDeleteObjects: false,
        });

        // DynamoDB Table for invoice templates
        this.templateTable = new dynamodb.Table(this, "TemplateTable", {
            tableName: "InvoiceTemplates",
            partitionKey: {
                name: "userId",
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: "templateId",
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            pointInTimeRecoverySpecification: {
                pointInTimeRecoveryEnabled: true,
            },
            removalPolicy: removalPolicy,
        });

        // Cognito Passwordless Authentication
        this.auth = new Passwordless(this, "Auth", {
            allowedOrigins: ["http://localhost:5173"], // Vite dev server
            magicLink: {
                sesFromAddress: "yalovechik2012@gmail.com",
                sesRegion: "eu-west-1", // Match your Cognito region
                autoConfirmUsers: true,
            },
            logLevel: environment === "dev" ? "DEBUG" : "INFO",
        });

        // Outputs
        new cdk.CfnOutput(this, "InvoiceBucketName", {
            value: this.invoiceBucket.bucketName,
            description: "S3 Bucket for invoice PDFs",
            exportName: "InvoiceBucketName",
        });

        new cdk.CfnOutput(this, "TemplateTableName", {
            value: this.templateTable.tableName,
            description: "DynamoDB table for invoice templates",
            exportName: "TemplateTableName",
        });

        new cdk.CfnOutput(this, "UserPoolId", {
            value: this.auth.userPool.userPoolId,
            description: "Cognito User Pool ID",
            exportName: "UserPoolId",
        });

        new cdk.CfnOutput(this, "UserPoolClientId", {
            value: this.auth.userPoolClient.userPoolClientId,
            description: "Cognito User Pool Client ID",
            exportName: "UserPoolClientId",
        });
    }
}
