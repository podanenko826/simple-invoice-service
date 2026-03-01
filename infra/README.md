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

- **Partition Key**: `userId` (String)
- **Sort Key**: `itemId` (String)
- **Item type prefixes**:
    - Invoices: `itemId = "INVOICE#<invoiceId>"`
    - Invoice templates: `itemId = "TEMPLATE#<templateId>"`
    - Usage records: `itemId = "USAGE#<usagePeriod>"` (for example, `USAGE#2024-01`)
- **Primary access patterns used by lambdas**:
    - Get a single item (invoice/template/usage) by `userId` + full `itemId`
    - List all invoices for a user with `Query(userId, begins_with(itemId, "INVOICE#"))`
    - List all templates for a user with `Query(userId, begins_with(itemId, "TEMPLATE#"))`
    - List usage records for a user with `Query(userId, begins_with(itemId, "USAGE#"))`
- **Purpose**: Multi-tenant table storing invoice metadata, invoice templates, and usage records
- **Billing**: Pay-per-request
- **Features**: Point-in-time recovery, AWS-managed encryption

#### 2. InvoiceTemplates (logical entity)

- **Storage**: Templates are stored in the **Invoices Table** as items with `itemId` starting with `TEMPLATE#`
- **Primary keys**:
    - `userId`: identifies the template owner
    - `itemId`: `TEMPLATE#<templateId>`
- **Access patterns**:
    - Get a template by `userId` + `TEMPLATE#<templateId>`
    - List all templates for a user via `Query(userId, begins_with(itemId, "TEMPLATE#"))`
- **Notes**: The invoice, template, and usage handlers all rely on this shared `userId` + `itemId` schema and prefix-based queries.

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
