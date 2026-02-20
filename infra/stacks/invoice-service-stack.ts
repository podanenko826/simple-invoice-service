import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class InvoiceServiceStack extends cdk.Stack {
  public readonly invoiceBucket: s3.Bucket;
  public readonly invoiceTable: dynamodb.Table;
  public readonly templateTable: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for storing invoice PDFs
    this.invoiceBucket = new s3.Bucket(this, 'InvoiceBucket', {
      bucketName: `invoice-pdfs-${this.account}-${this.region}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: 'DeleteOldVersions',
          noncurrentVersionExpiration: cdk.Duration.days(90),
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    });

    // DynamoDB Table for invoice metadata
    this.invoiceTable = new dynamodb.Table(this, 'InvoiceTable', {
      tableName: 'Invoices',
      partitionKey: {
        name: 'invoiceId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI for querying by date
    this.invoiceTable.addGlobalSecondaryIndex({
      indexName: 'DateIndex',
      partitionKey: {
        name: 'status',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'createdAt',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // DynamoDB Table for invoice templates
    this.templateTable = new dynamodb.Table(this, 'TemplateTable', {
      tableName: 'InvoiceTemplates',
      partitionKey: {
        name: 'userId',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'templateId',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Outputs
    new cdk.CfnOutput(this, 'InvoiceBucketName', {
      value: this.invoiceBucket.bucketName,
      description: 'S3 Bucket for invoice PDFs',
      exportName: 'InvoiceBucketName',
    });

    new cdk.CfnOutput(this, 'InvoiceTableName', {
      value: this.invoiceTable.tableName,
      description: 'DynamoDB table for invoice metadata',
      exportName: 'InvoiceTableName',
    });

    new cdk.CfnOutput(this, 'TemplateTableName', {
      value: this.templateTable.tableName,
      description: 'DynamoDB table for invoice templates',
      exportName: 'TemplateTableName',
    });
  }
}
