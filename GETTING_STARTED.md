# Getting Started

This project has two independent folders:

## Frontend (React Application)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Frontend Commands:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Infrastructure (AWS CDK)

```bash
cd infra
npm install
npm run bootstrap  # First time only
npm run deploy
```

### Infrastructure Commands:
- `npm run bootstrap` - Bootstrap CDK (first time only)
- `npm run deploy` - Deploy to AWS
- `npm run synth` - Generate CloudFormation template
- `npm run diff` - Show changes before deploy
- `npm run destroy` - Remove infrastructure

## Prerequisites

- Node.js 18+
- AWS CLI configured (for infrastructure deployment)

## Project Structure

```
simple-invoice-service/
├── frontend/          # React app (independent)
│   └── package.json
└── infra/            # AWS CDK (independent)
    └── package.json
```

Each folder is completely independent with its own dependencies.
