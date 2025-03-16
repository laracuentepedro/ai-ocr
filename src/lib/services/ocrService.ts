import { Mistral } from '@mistralai/mistralai';

type OcrResult = {
  pages?: Array<{
    index: number;
    markdown: string;
    images: Array<{
      id: string;
      top_left_x: number;
      top_left_y: number;
      bottom_right_x: number;
      bottom_right_y: number;
      image_base64: string;
    }>;
    dimensions: {
      dpi: number;
      height: number;
      width: number;
    };
  }>;
  text?: string;
  content?: string;
};

export type ProcessFileResponse = {
  success: boolean;
  result?: OcrResult | OcrResult[];
  error?: string;
};

export async function processFile(files: File | File[]): Promise<ProcessFileResponse> {
  try {
    // Create form data to send the file(s)
    const formData = new FormData();
    
    // Handle both single file and multiple files
    if (Array.isArray(files)) {
      // Multiple files
      files.forEach((file, index) => {
        formData.append(`files`, file);
      });
    } else {
      // Single file (backward compatibility)
      formData.append('file', files);
    }
    
    // Send the file(s) to our API endpoint
    const response = await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process the file(s)');
    }
    
    const data = await response.json();
    return {
      success: true,
      result: data.result
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'An error occurred during processing. Please try again.'
    };
  }
}

export function formatOcrResult(result: OcrResult | OcrResult[] | undefined, fileNames: string | string[]): string {
  if (!result) return '';
  
  // Handle array of results (multiple files)
  if (Array.isArray(result) && Array.isArray(fileNames)) {
    return result.map((singleResult, index) => {
      const fileName = fileNames[index] || `File ${index + 1}`;
      return formatSingleOcrResult(singleResult, fileName);
    }).join('\n\n---\n\n');
  }
  
  // Handle single result (backward compatibility)
  return formatSingleOcrResult(result as OcrResult, fileNames as string);
}

// Helper function to format a single OCR result
function formatSingleOcrResult(result: OcrResult, fileName: string): string {
  let ocrText = '';
  
  if (Array.isArray(result)) {
    // If the result itself is an array of pages
    ocrText = result.map(page => page.markdown || page.text || '').join('\n\n');
  } else if (typeof result.text === 'string') {
    ocrText = result.text;
  } else if (result.content) {
    ocrText = result.content;
  } else if (result.pages && Array.isArray(result.pages)) {
    // If the response has a pages array, concatenate text from all pages
    ocrText = result.pages.map(page => page.markdown || page.text || '').join('\n\n');
  }
  
  // Create a simple markdown format with the extracted text
  return `# OCR Result for ${fileName}\n\n${ocrText}`;
}