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
    
    // Check for multiple files
    const filesEntries = formData.getAll('files');
    const singleFile = formData.get('file');
    
    // Handle both single and multiple file cases
    const files = filesEntries.length > 0 ? filesEntries : (singleFile ? [singleFile] : []);
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Process each file and collect responses
    const ocrResponses = [];
    
    for (const file of files) {
      // Get file type
      const fileType = (file as File).type;
      const isImage = fileType.startsWith('image/');
      const isPdf = fileType === 'application/pdf';
      
      if (!isImage && !isPdf) {
        return NextResponse.json(
          { error: `Invalid file type for ${(file as File).name}. Only images and PDFs are supported.` },
          { status: 400 }
        );
      }

      // Process the file based on its type
      let ocrResponse;
      
      if (isImage) {
        // For images, convert to base64 and use directly
        const arrayBuffer = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const dataUrl = `data:${(file as File).type};base64,${base64}`;
        
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
        const arrayBuffer = await (file as File).arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Upload the PDF file
        const uploadedPdf = await client.files.upload({
          file: {
            fileName: (file as File).name,
            content: buffer,
          },
          purpose: "ocr" as const
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
      
      ocrResponses.push(ocrResponse);
    }
    
    // Return single result or array of results based on input
    const result = files.length === 1 && singleFile ? ocrResponses[0] : ocrResponses;
    return NextResponse.json({ result });
    
  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process the file' },
      { status: 500 }
    );
  }
}