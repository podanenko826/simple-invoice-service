import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { Passwordless } from "./constructs/cognito-paswordless/cognito-paswordless.js";
import { PublicWebsite } from "./constructs/public-websites/public-websites.js";
import * as path from "path";
import { fileURLToPath } from "url";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface InvoiceServiceStackProps extends cdk.StackProps {
    readonly certificateArn?: string;
    readonly domainName?: string;
}

export class InvoiceServiceStack extends cdk.Stack {
    public readonly invoiceBucket: s3.Bucket;
    public readonly invoiceDataTable: dynamodb.Table;
    public readonly auth: Passwordless;
    public readonly website: PublicWebsite;

    constructor(scope: Construct, id: string, props: InvoiceServiceStackProps) {
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

        // DynamoDB Table for all invoice data (templates + invoices)
        // Single table design with composite sort key
        this.invoiceDataTable = new dynamodb.Table(this, "InvoiceDataTable", {
            tableName: `${projectNamePrfix}-invoice-data-${environment}`,
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
        if (props.domainName) {
            allowedOrigins.push(`https://${props.domainName}`);
        }

        // @todo check how we put this API KEY
        this.auth = new Passwordless(this, "Auth", {
            allowedOrigins: allowedOrigins, // Vite dev server + production domain
            magicLink: {
                emailFromAddress: "noreply@em5604.makeinvoices.app",
                autoConfirmUsers: true,
            },
            logLevel: environment === "dev" ? "DEBUG" : "INFO",
        });

        // Common Lambda configuration
        const lambdaEnvironment = {
            TABLE_NAME: this.invoiceDataTable.tableName,
            BUCKET_NAME: this.invoiceBucket.bucketName,
        };

        const lambdaProps = {
            runtime: lambda.Runtime.NODEJS_20_X,
            timeout: cdk.Duration.seconds(30),
            environment: lambdaEnvironment,
            bundling: {
                minify: true,
                sourceMap: true,
                externalModules: ["@aws-sdk/*"], // Use AWS SDK from Lambda runtime
            },
        };

        // Template Lambda Functions (separate GET and POST for caching)
        const getTemplateFunction = new NodejsFunction(
            this,
            "GetTemplateFunction",
            {
                ...lambdaProps,
                entry: path.join(
                    __dirname,
                    "../lambda/invoice-api/get-template.ts"
                ),
                handler: "handler",
                description: "Get user's invoice template",
            }
        );

        const saveTemplateFunction = new NodejsFunction(
            this,
            "SaveTemplateFunction",
            {
                ...lambdaProps,
                entry: path.join(
                    __dirname,
                    "../lambda/invoice-api/save-template.ts"
                ),
                handler: "handler",
                description: "Save user's invoice template",
            }
        );

        // Invoice Lambda Functions (separate for caching)
        const listInvoicesFunction = new NodejsFunction(
            this,
            "ListInvoicesFunction",
            {
                ...lambdaProps,
                entry: path.join(
                    __dirname,
                    "../lambda/invoice-api/list-invoices.ts"
                ),
                handler: "handler",
                description: "List all invoices for user",
            }
        );

        const getInvoiceFunction = new NodejsFunction(
            this,
            "GetInvoiceFunction",
            {
                ...lambdaProps,
                entry: path.join(
                    __dirname,
                    "../lambda/invoice-api/get-invoice.ts"
                ),
                handler: "handler",
                description: "Get specific invoice",
            }
        );

        const saveInvoiceFunction = new NodejsFunction(
            this,
            "SaveInvoiceFunction",
            {
                ...lambdaProps,
                entry: path.join(
                    __dirname,
                    "../lambda/invoice-api/save-invoice.ts"
                ),
                handler: "handler",
                description: "Save new invoice",
            }
        );

        const deleteInvoiceFunction = new NodejsFunction(
            this,
            "DeleteInvoiceFunction",
            {
                ...lambdaProps,
                entry: path.join(
                    __dirname,
                    "../lambda/invoice-api/delete-invoice.ts"
                ),
                handler: "handler",
                description: "Delete invoice",
            }
        );

        // Grant DynamoDB permissions
        this.invoiceDataTable.grantReadData(getTemplateFunction);
        this.invoiceDataTable.grantReadData(listInvoicesFunction);
        this.invoiceDataTable.grantReadData(getInvoiceFunction);
        this.invoiceDataTable.grantWriteData(saveTemplateFunction);
        this.invoiceDataTable.grantWriteData(saveInvoiceFunction);
        this.invoiceDataTable.grantWriteData(deleteInvoiceFunction);

        // Grant S3 permissions
        this.invoiceBucket.grantReadWrite(saveInvoiceFunction);
        this.invoiceBucket.grantRead(getInvoiceFunction);
        this.invoiceBucket.grantRead(listInvoicesFunction);

        // Create API Gateway (without expensive cache cluster)
        const apiCorsOrigins = ["http://localhost:5173"];
        if (props.domainName) {
            apiCorsOrigins.push(`https://${props.domainName}`);
        }

        const api = new apigateway.RestApi(this, "InvoiceApi", {
            restApiName: `${projectNamePrfix}-invoice-api-${environment}`,
            description: "API for invoice management",
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

        // Create Cognito authorizer
        const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
            this,
            "ApiAuthorizer",
            {
                cognitoUserPools: [this.auth.userPool],
                identitySource: "method.request.header.Authorization",
            }
        );

        // Common method options
        const authMethodOptions = {
            authorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        };

        // Template endpoints
        const templates = api.root.addResource("templates");

        // GET /templates
        templates.addMethod(
            "GET",
            new apigateway.LambdaIntegration(getTemplateFunction),
            authMethodOptions
        );

        // POST /templates
        templates.addMethod(
            "POST",
            new apigateway.LambdaIntegration(saveTemplateFunction),
            authMethodOptions
        );

        // Invoice endpoints
        const invoices = api.root.addResource("invoices");

        // GET /invoices
        invoices.addMethod(
            "GET",
            new apigateway.LambdaIntegration(listInvoicesFunction),
            authMethodOptions
        );

        // POST /invoices
        invoices.addMethod(
            "POST",
            new apigateway.LambdaIntegration(saveInvoiceFunction),
            authMethodOptions
        );

        // Single invoice endpoint
        const invoice = invoices.addResource("{invoiceId}");

        // GET /invoices/{id}
        invoice.addMethod(
            "GET",
            new apigateway.LambdaIntegration(getInvoiceFunction),
            authMethodOptions
        );

        // DELETE /invoices/{id}
        invoice.addMethod(
            "DELETE",
            new apigateway.LambdaIntegration(deleteInvoiceFunction),
            authMethodOptions
        );

        // Create public website with CloudFront distribution
        this.website = new PublicWebsite(this, "PublicWebsite", {
            userPoolId: this.auth.userPool.userPoolId,
            userPoolClientId: this.auth.userPoolClient.userPoolClientId,
            apiUrl: api.url,
            certificateArn: props.certificateArn,
            domainName: props.domainName,
        });

        // Create Route53 A record pointing to CloudFront
        if (props.domainName) {
            const hostedZone = route53.HostedZone.fromLookup(
                this,
                "HostedZone",
                {
                    domainName: props.domainName,
                }
            );

            new route53.ARecord(this, "WebsiteAliasRecord", {
                zone: hostedZone,
                recordName: props.domainName,
                target: route53.RecordTarget.fromAlias(
                    new targets.CloudFrontTarget(this.website.distribution)
                ),
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
