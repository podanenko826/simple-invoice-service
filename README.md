# Simple Invoice Service

A lightweight, browser-based invoice generation application built with React, Bootstrap, and jsPDF.

## Features

- 📄 Generate professional PDF invoices
- 📝 Customizable invoice templates
- 💾 Local data storage (browser-based)
- 🎨 Live invoice preview
- 📱 Responsive design
- 🚀 No backend required

## Tech Stack

- React 19
- TypeScript
- Bootstrap 5
- React Bootstrap
- jsPDF (PDF generation)
- Vite (build tool)
- AWS CDK (Infrastructure as Code)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd simple-invoice-service
```

2. Install frontend dependencies

```bash
cd frontend
npm install
```

3. Install infrastructure dependencies

```bash
cd ../infra
npm install
```

4. Start the frontend development server

```bash
cd ../frontend
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
cd frontend
npm run build
```

The built files will be in the `frontend/dist` directory.

### Preview Production Build

```bash
cd frontend
npm run preview
```

## How to Use

### 1. Set Up Your Template

- Navigate to the **Template** tab
- Fill in your details:
    - **Salary Rate**: Your billing amount and currency
    - **Your Details**: Name, address, email, tax ID
    - **Client Details**: Client name, address, tax ID
    - **Service & Payment**: Description, payment terms, bank details
- Click **Save Template**
- See live preview on the right (desktop only)

### 2. Generate an Invoice

- Navigate to the **Generate** tab
- Review pre-filled information from your template
- Adjust if needed:
    - Invoice number
    - Invoice date
    - Due date
    - Amount
    - Notes (optional)
- Click **Generate & Download PDF**
- Your invoice will download automatically

### 3. View History

- Navigate to the **History** tab
- View previously generated invoices
- See invoice numbers, dates, and amounts

## Project Structure

```
simple-invoice-service/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── routes/          # Page components
│   │   ├── lib/             # Utilities
│   │   ├── types/           # TypeScript types
│   │   └── assets/          # Static assets
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── infra/                   # AWS CDK infrastructure
    ├── stacks/
    │   └── invoice-service-stack.ts
    ├── app.ts
    ├── cdk.json
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

Each folder is completely independent with its own dependencies and configuration.

## Customization

### Currency Support

Currently supports: EUR (€), USD ($), UAH (₴)

To add more currencies, edit:

- `src/lib/currencySymbols.ts` - Add to `currencySymbols`

### PDF Layout

Modify `src/lib/generatePdf.ts` to customize:

- Page layout and margins
- Font sizes and styles
- Colors and spacing
- Additional fields

## Data Storage

Uses **localStorage** for persistent data storage:

- **Templates**: Saved automatically when you click "Save Template"
- **Invoice History**: Automatically saved when you generate an invoice
- **Data Persistence**: Data persists across browser sessions
- **Privacy**: All data stays in your browser

### Storage Limits

- localStorage typically allows 5-10MB per domain
- Sufficient for hundreds of invoices

### Backup & Export

To backup your data:

1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Find localStorage for your domain
4. Copy the data

**Future Enhancement**: Add export/import functionality for easy backups.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## AWS Infrastructure

This project includes AWS CDK infrastructure for cloud deployment:

- S3 bucket for PDF storage
- DynamoDB tables for invoice data and templates
- See `infra/README.md` for deployment instructions

To deploy the infrastructure:
```bash
cd infra
npm run deploy
```

To bootstrap CDK (first time only):
```bash
cd infra
npm run bootstrap
```

For more details, check the [Infrastructure README](infra/README.md).

## License

MIT

## Contributing

Contributions welcome! Please open an issue or submit a pull request.
