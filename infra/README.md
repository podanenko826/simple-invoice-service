# Invoice Service Infrastructure

AWS CDK infrastructure for the Simple Invoice Service application.

## Resources Provisioned

### S3 Bucket
- **Purpose**: Store invoice PDF files
- **Features**:
  - Server-side encryption (S3-managed)
  - Versioning enabled
  - Block all public access
  - Lifecycle policy: Delete old versions after 90 days
  - Retention policy: RETAIN (won't delete on stack deletion)

### DynamoDB Tables

#### 1. Invoices Table
- **Partition Key**: `invoiceId` (String)
- **Sort Key**: `createdAt` (String)
- **GSI**: DateIndex (status + createdAt)
- **Purpose**: Store invoice metadata and history
- **Billing**: Pay-per-request
- **Features**: Point-in-time recovery, AWS-managed encryption

#### 2. InvoiceTemplates Table
- **Partition Key**: `userId` (String)
- **Sort Key**: `templateId` (String)
- **Purpose**: Store user invoice templates
- **Billing**: Pay-per-request
- **Features**: Point-in-time recovery, AWS-managed encryption

## Prerequisites

1. AWS CLI configured with credentials
2. Node.js 18+ installed

## Setup

Install dependencies:
```bash
npm install
```

## Deployment

### Bootstrap CDK (first time only):
```bash
npm run bootstrap
```

### Deploy the stack:
```bash
npm run deploy
```

### View changes before deploying:
```bash
npm run diff
```

### Synthesize CloudFormation template:
```bash
npm run synth
```

### Destroy the stack:
```bash
npm run destroy
```

## Outputs

After deployment, you'll get:
- `InvoiceBucketName`: S3 bucket name for PDFs
- `InvoiceTableName`: DynamoDB table name for invoices
- `TemplateTableName`: DynamoDB table name for templates

## Cost Considerations

- **S3**: Pay for storage and requests
- **DynamoDB**: Pay-per-request pricing (no minimum cost)
- **Estimated monthly cost**: ~$1-5 for low usage

## Security

- All resources use encryption at rest
- S3 bucket blocks all public access
- DynamoDB tables use AWS-managed encryption
- Point-in-time recovery enabled for data protection

## Next Steps

To integrate with your React app:
1. Set up AWS Amplify or AWS SDK
2. Configure IAM roles/policies for access
3. Update frontend to use S3 for PDF storage
4. Update frontend to use DynamoDB for data persistence
