# AI OCR Tool

A web application that uses Mistral AI's OCR capabilities to extract text from images and PDF documents.

## Features

- Upload images (JPEG, PNG) and PDF files
- Extract text content using Mistral AI's OCR API
- Display results in markdown format
- Responsive UI for all device sizes

## Project Structure

```
/src
  /app             # Next.js app router
    /api           # API routes
      /ocr         # OCR processing endpoint
    page.tsx       # Main application page
    layout.tsx     # Root layout
  /lib             # Utility libraries
    /hooks         # React custom hooks
    /services      # Service modules
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Mistral AI API key

### Setup

1. Create a `.env` file in the root directory with your Mistral API key:
   ```
   MISTRAL_API_KEY=your_api_key_here
   ```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
