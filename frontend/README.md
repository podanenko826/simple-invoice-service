# Simple Invoice Service - Frontend

React-based frontend application for generating and managing invoices.

## Development

### Start development server:
```bash
npm run dev
```

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Lint code:
```bash
npm run lint
```

## Tech Stack

- React 19
- TypeScript
- Vite
- Bootstrap 5
- React Bootstrap
- jsPDF
- React Router

## Features

- Generate professional PDF invoices
- Customizable invoice templates
- Local data storage (browser-based)
- Live invoice preview
- Responsive design

## Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── GenerateInvoice.tsx
│   │   ├── TemplateForm.tsx
│   │   ├── InvoiceHistory.tsx
│   │   └── InvoicePreview.tsx
│   ├── routes/              # Page components
│   ├── lib/                 # Utilities
│   │   ├── generatePdf.ts
│   │   ├── storage.ts
│   │   └── currencySymbols.ts
│   ├── types/               # TypeScript types
│   │   └── invoice.ts
│   └── assets/              # Static assets
├── index.html
├── vite.config.ts
└── package.json
```

## Configuration

The Vite configuration is in `vite.config.ts`. Modify as needed for your deployment environment.
