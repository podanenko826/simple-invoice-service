import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";
import { Passwordless } from "./constructs/cognito-paswordless/cognito-paswordless.js";
import { PublicWebsite } from "./constructs/public-websites/public-websites.js";
import * as path from "path";
import { fileURLToPath } from "url";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import {
    Monitoring,
} from "./constructs/monitoring/monitoring.js";
import { ExtendedStackProps } from "./ExtendedStackProps.js";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InfrastructureStackProps extends ExtendedStackProps {
    environment: string;
    certificateArn: string;
}

export class InvoiceServiceStack extends cdk.Stack {
    public readonly invoiceBucket: s3.Bucket;
    public readonly feedbackBucket: s3.Bucket;
    public readonly invoiceDataTable: dynamodb.Table;
    public readonly auth: Passwordless;
    public readonly website: PublicWebsite;
    public readonly api: apigateway.RestApi;

    constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
        super(scope, id, props);

        const config = props.config;
        const projectNamePrfix = config.projectNamePrefix;
        const environment = props.environment;
        const removalPolicy =
            environment === "dev"
                ? cdk.RemovalPolicy.DESTROY
                : cdk.RemovalPolicy.RETAIN;
        const { account } = cdk.Stack.of(this);

        // S3 Bucket for storing invoice PDFs
        this.invoiceBucket = new s3.Bucket(this, "InvoiceBucket", {
            bucketName: `${projectNamePrfix}-invoices-${account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            versioned: true,
            removalPolicy: removalPolicy,
            autoDeleteObjects: false,
        });

        // S3 Bucket for storing user feedback (cheaper than DynamoDB)
        this.feedbackBucket = new s3.Bucket(this, "FeedbackBucket", {
            bucketName: `${projectNamePrfix}-feedback-${account}`,
            encryption: s3.BucketEncryption.S3_MANAGED,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            versioned: false,
            removalPolicy: removalPolicy,
            autoDeleteObjects: environment === "dev",
            lifecycleRules: [
                {
                    // Move to cheaper storage after 90 days
                    transitions: [
                        {
                            storageClass: s3.StorageClass.GLACIER,
                            transitionAfter: cdk.Duration.days(90),
                        },
                    ],
                },
            ],
        });

        // DynamoDB Table for all invoice data (templates + invoices)
        // Single table design with composite sort key
        this.invoiceDataTable = new dynamodb.Table(this, "InvoiceDataTable", {
            tableName: `${projectNamePrfix}-data`,
            partitionKey: {
                name: "userId",
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: "itemId",
                type: dynamodb.AttributeType.STRING,
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            encryption: dynamodb.TableEncryption.AWS_MANAGED,
            pointInTimeRecoverySpecification: {
                pointInTimeRecoveryEnabled: true,
            },
            removalPolicy: removalPolicy,
            stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES, // For future audit/sync
        });

        // Add GSI for querying by item type (TEMPLATE or INVOICE)
        this.invoiceDataTable.addGlobalSecondaryIndex({
            indexName: "TypeIndex",
            partitionKey: {
                name: "GSI1PK",
                type: dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: "GSI1SK",
                type: dynamodb.AttributeType.STRING,
            },
            projectionType: dynamodb.ProjectionType.ALL,
        });

        // Cognito Passwordless Authentication
        const allowedOrigins = ["http://localhost:5173"];
        if (config.domainName) {
            allowedOrigins.push(`https://${config.domainName}`);
        }

        this.auth = new Passwordless(this, "Auth", {
            projectNamePrefix: projectNamePrfix,
            environment: environment,
            allowedOrigins: allowedOrigins,
            magicLink: {
                emailFromAddress: "noreply@em5604.makeinvoices.app",
                autoConfirmUsers: true,
            },
            logLevel: environment === "dev" ? "DEBUG" : "INFO",
        });

        // SNS Topic for feedback notifications
        let feedbackTopic: sns.Topic | undefined;
        if (config.alertEmail) {
            feedbackTopic = new sns.Topic(this, "FeedbackTopic", {
                displayName: `OneThing Invoice Feedback - ${environment}`,
                topicName: `${projectNamePrfix}-feedback`,
            });

            feedbackTopic.addSubscription(
                new subscriptions.EmailSubscription(config.alertEmail)
            );

            new cdk.CfnOutput(this, "FeedbackTopicArn", {
                value: feedbackTopic.topicArn,
                description: "SNS Topic ARN for feedback notifications",
            });
        }

        // Single consolidated Lambda function for the entire Invoice API
        const apiFunction = new NodejsFunction(this, "InvoiceApiFunction", {
            functionName: `${projectNamePrfix}-api`,
            entry: path.join(
                __dirname,
                "../../lambda/invoice-api/handler.ts"
            ),
            handler: "handler",
            runtime: lambda.Runtime.NODEJS_20_X,
            architecture: lambda.Architecture.ARM_64,
            timeout: cdk.Duration.seconds(30),
            memorySize: 256,
            description: `[${environment}] Invoice API (consolidated router)`,
            environment: {
                TABLE_NAME: this.invoiceDataTable.tableName,
                BUCKET_NAME: this.invoiceBucket.bucketName,
                FEEDBACK_BUCKET: this.feedbackBucket.bucketName,
                FEEDBACK_TOPIC_ARN: feedbackTopic?.topicArn || "",
            },
            bundling: {
                minify: true,
                sourceMap: true,
                format: cdk.aws_lambda_nodejs.OutputFormat.ESM,
                externalModules: ["@aws-sdk/*"],
            },
        });

        // Grant all necessary permissions to the single function
        this.invoiceDataTable.grantReadWriteData(apiFunction);
        this.invoiceBucket.grantReadWrite(apiFunction);
        this.feedbackBucket.grantWrite(apiFunction);

        if (feedbackTopic) {
            feedbackTopic.grantPublish(apiFunction);
        }

        // Create API Gateway
        const apiCorsOrigins = ["http://localhost:5173"];
        if (config.domainName) {
            apiCorsOrigins.push(`https://${config.domainName}`);
        }

        const api = new apigateway.RestApi(this, "InvoiceApi", {
            restApiName: `${projectNamePrfix}-api`,
            description: `[${environment}] Invoice management API`,
            deployOptions: {
                stageName: "prod",
                metricsEnabled: true,
                tracingEnabled: true,
            },
            defaultCorsPreflightOptions: {
                allowOrigins: apiCorsOrigins,
                allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                allowHeaders: [
                    "Content-Type",
                    "Authorization",
                    "X-Amz-Date",
                    "X-Api-Key",
                    "X-Amz-Security-Token",
                ],
                allowCredentials: true,
            },
        });

        this.api = api;

        // Create Cognito authorizer
        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
            this,
            "ApiAuthorizer",
            {
                cognitoUserPools: [this.auth.userPool],
                identitySource: "method.request.header.Authorization",
            }
        );

        const authMethodOptions = {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        };

        // Single Lambda integration for all routes
        const apiIntegration = new apigateway.LambdaIntegration(apiFunction);

        // Template endpoints
        const templates = api.root.addResource("templates");
        templates.addMethod("GET", apiIntegration, authMethodOptions);
        templates.addMethod("POST", apiIntegration, authMethodOptions);

        // Invoice endpoints
        const invoices = api.root.addResource("invoices");
        invoices.addMethod("GET", apiIntegration, authMethodOptions);
        invoices.addMethod("POST", apiIntegration, authMethodOptions);

        const invoice = invoices.addResource("{invoiceId}");
        invoice.addMethod("GET", apiIntegration, authMethodOptions);
        invoice.addMethod("DELETE", apiIntegration, authMethodOptions);

        // Usage endpoint
        const usage = api.root.addResource("usage");
        usage.addMethod("GET", apiIntegration, authMethodOptions);

        // Feedback endpoint
        const feedback = api.root.addResource("feedback");
        feedback.addMethod("POST", apiIntegration, authMethodOptions);

        // Global stats endpoint (public - no auth)
        const stats = api.root.addResource("stats");
        stats.addMethod("GET", apiIntegration);

        // Create public website with CloudFront distribution
        this.website = new PublicWebsite(this, "PublicWebsite", {
            userPoolId: this.auth.userPool.userPoolId,
            userPoolClientId: this.auth.userPoolClient.userPoolClientId,
            apiUrl: api.url,
            certificateArn: props.certificateArn,
            domainName: config.domainName,
            projectNamePrefix: projectNamePrfix,
            environment: environment,
        });

        // Create Route53 A record pointing to CloudFront
        if (config.domainName) {
            const hostedZone = route53.HostedZone.fromLookup(
                this,
                "HostedZone",
                {
                    domainName: config.domainName,
                }
            );

            new route53.ARecord(this, "WebsiteAliasRecord", {
                zone: hostedZone,
                recordName: config.domainName,
                target: route53.RecordTarget.fromAlias(
                    new targets.CloudFrontTarget(this.website.distribution)
                ),
            });
        }

        // Add monitoring if alertEmail is provided
        if (config.alertEmail) {
            new Monitoring(this, "Monitoring", {
                api: api,
                userPool: this.auth.userPool,
                alertEmail: config.alertEmail,
                environment: environment,
                thresholds: config.monitoringThresholds
            });
        }

        // Outputs
        new cdk.CfnOutput(this, "InvoiceBucketName", {
            value: this.invoiceBucket.bucketName,
            description: "S3 Bucket for invoice PDFs",
            exportName: `${projectNamePrfix}-InvoiceBucketName-${environment}`,
        });

        new cdk.CfnOutput(this, "InvoiceDataTableName", {
            value: this.invoiceDataTable.tableName,
            description:
                "DynamoDB table for invoice data (templates + invoices)",
            exportName: `${projectNamePrfix}-InvoiceDataTableName-${environment}`,
        });

        new cdk.CfnOutput(this, "ApiUrl", {
            value: api.url,
            description: "Invoice API Gateway URL",
            exportName: `${projectNamePrfix}-ApiUrl-${environment}`,
        });

        new cdk.CfnOutput(this, "UserPoolId", {
            value: this.auth.userPool.userPoolId,
            description: "Cognito User Pool ID",
            exportName: `${projectNamePrfix}-UserPoolId-${environment}`,
        });

        new cdk.CfnOutput(this, "UserPoolClientId", {
            value: this.auth.userPoolClient.userPoolClientId,
            description: "Cognito User Pool Client ID",
            exportName: `${projectNamePrfix}-UserPoolClientId-${environment}`,
        });
    }
}
