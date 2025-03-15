'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { processFile, formatOcrResult } from '@/lib/services/ocrService';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [markdownResult, setMarkdownResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const {
    file,
    preview,
    error,
    fileInputRef,
    handleFileChange,
    handleDragOver,
    handleDrop,
    triggerFileInput,
    resetForm: resetFileForm
  } = useFileUpload();

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setIsUploading(true);
    setApiError(null);
    
    const response = await processFile(file);
    
    if (response.success && response.result) {
      setMarkdownResult(formatOcrResult(response.result, file.name));
    } else if (response.error) {
      setApiError(response.error);
    }
    
    setIsUploading(false);
  };

  const resetForm = () => {
    resetFileForm();
    setMarkdownResult(null);
    setApiError(null);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8 md:mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">AI OCR Tool</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Upload an image or PDF to extract text as markdown</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
        <section className="flex flex-col gap-6 h-full">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 md:p-8 flex flex-col items-center justify-center min-h-64 md:min-h-80 cursor-pointer transition-colors ${error || apiError ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileChange} 
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/jpg,application/pdf"
            />
            <Image
              src="/upload.svg"
              alt="Upload"
              width={64}
              height={64}
              className="mb-6 text-gray-400"
            />
            <p className="text-center mb-3 text-lg">
              {file ? file.name : 'Drag & drop your file here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Supports JPEG, PNG, and PDF files
            </p>
            {(error || apiError) && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error || apiError}</p>
            )}
          </div>

          {file && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                {isUploading ? 'Processing...' : 'Process File'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg"
              >
                Reset
              </button>
            </div>
          )}
        </section>

        <section className="flex flex-col gap-4 h-full">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Preview & Results</h2>
          
          {preview ? (
            <div className="border rounded-lg overflow-hidden mb-4 bg-white dark:bg-gray-800 shadow-sm">
              <img src={preview} alt="Preview" className="w-full object-contain h-64 md:h-80" />
            </div>
          ) : file ? (
            <div className="border rounded-lg p-6 mb-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900 h-64 md:h-80 shadow-sm">
              <p className="text-gray-500 text-lg">{file.name} (PDF preview not available)</p>
            </div>
          ) : (
            <div className="border rounded-lg p-6 mb-4 flex items-center justify-center bg-gray-50 dark:bg-gray-900 h-64 md:h-80 shadow-sm">
              <p className="text-gray-500 text-lg">No file selected</p>
            </div>
          )}

          {markdownResult && (
            <div className="border rounded-lg p-6 bg-white dark:bg-gray-900 shadow-sm">
              <h3 className="text-lg md:text-xl font-medium mb-3">Extracted Markdown</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded overflow-auto max-h-64 md:max-h-80 font-mono text-sm whitespace-pre-wrap">
                {markdownResult}
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-12 md:mt-16 text-center text-sm text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
        <p>AI OCR Tool - Powered by Next.js and Mistral AI</p>
      </footer>
    </div>
  );
}
