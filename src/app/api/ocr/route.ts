import { NextRequest, NextResponse } from 'next/server';
import { createMistralClient } from '@/lib/services/mistralClient';

export async function POST(request: NextRequest) {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.MISTRAL_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Mistral API key is not configured' },
        { status: 500 }
      );
    }

    // Initialize Mistral client
    const client = createMistralClient(apiKey);
    
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file type
    const fileType = file.type;
    const isImage = fileType.startsWith('image/');
    const isPdf = fileType === 'application/pdf';
    
    if (!isImage && !isPdf) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and PDFs are supported.' },
        { status: 400 }
      );
    }

    // Process the file based on its type
    let ocrResponse;
    
    if (isImage) {
      // For images, convert to base64 and use directly
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;
      
      // Process with Mistral OCR
      ocrResponse = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "image_url",
          imageUrl: dataUrl,
        }
      });
    } else {
      // For PDFs, we need to upload the file first
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Upload the PDF file
      const uploadedPdf = await client.files.upload({
        file: {
          fileName: file.name,
          content: buffer,
        },
        purpose: "ocr"
      });
      
      // Get a signed URL for the uploaded file
      const signedUrl = await client.files.getSignedUrl({
        fileId: uploadedPdf.id,
      });
      
      // Process with Mistral OCR using the signed URL
      ocrResponse = await client.ocr.process({
        model: "mistral-ocr-latest",
        document: {
          type: "document_url",
          documentUrl: signedUrl.url,
        }
      });
    }
    
    // Return the OCR response
    return NextResponse.json({ result: ocrResponse });
    
  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process the file' },
      { status: 500 }
    );
  }
}