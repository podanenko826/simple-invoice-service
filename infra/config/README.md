# Environment Configuration

This directory contains environment-specific configuration files for the CDK infrastructure.

## Configuration Files

- `dev.yaml` - Development environment configuration
- `prod.yaml` - Production environment configuration
- `config.interface.ts` - TypeScript interface defining the configuration structure

## Configuration Properties

| Property | Description | Example |
|----------|-------------|---------|
| `projectNamePrefix` | Prefix for all stack names (empty string for no prefix) | `"onething"` or `""` |
| `domainName` | Domain name for the application | `"makeinvoices.app"` |
| `alertEmail` | Email address for monitoring alerts and notifications | `"contact@makeinvoices.app"` |
| `account` | AWS account ID | `"350610702366"` |
| `region` | Primary AWS region for main stack | `"eu-west-1"` |
| `certificateRegion` | AWS region for CloudFront certificate (must be us-east-1) | `"us-east-1"` |

## Usage

Deploy to a specific environment using the `DEPLOY_ENV` environment variable:

```bash
# Deploy to dev environment (default)
DEPLOY_ENV=dev cdk deploy --all

# Deploy to prod environment
DEPLOY_ENV=prod cdk deploy --all
```

If `DEPLOY_ENV` is not specified, it defaults to `dev`.

## Stack Naming

Stack names are generated based on the `projectNamePrefix`:

- **Dev environment** (empty prefix):
  - `CertificatesStack`
  - `InvoiceServiceStack`

- **Prod environment** (prefix: "onething"):
  - `onething-CertificatesStack`
  - `onething-InvoiceServiceStack`

This allows multiple environments to coexist in the same AWS account without conflicts.
