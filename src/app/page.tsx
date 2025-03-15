'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { processFile, formatOcrResult } from '@/lib/services/ocrService';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [markdownResult, setMarkdownResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showRendered, setShowRendered] = useState(true);
  
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

  const toggleMarkdownView = () => {
    setShowRendered(!showRendered);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8 md:mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">AI OCR Tool</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Upload an image or PDF to extract text as markdown</p>
      </header>

      <main className="max-w-3xl mx-auto flex flex-col gap-6 md:gap-8">
        <section className="flex flex-col gap-6 w-full">
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

        {markdownResult && (
          <section className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center">
              <h2 className="text-xl md:text-2xl font-semibold">Extracted Text</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {showRendered ? 'Rendered' : 'Raw'}
                </span>
                <button 
                  onClick={toggleMarkdownView}
                  className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700"
                >
                  <span 
                    className={`${showRendered ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                  />
                </button>
              </div>
            </div>
            
            <div className="border rounded-lg p-6 bg-white dark:bg-gray-900 shadow-sm">
              {showRendered ? (
                <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(markdownResult) }} />
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96 font-mono text-sm whitespace-pre-wrap">
                  {markdownResult}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-12 md:mt-16 text-center text-sm text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
        <p>AI OCR Tool - Powered by Next.js and Mistral AI</p>
      </footer>
    </div>
  );
}

// Simple markdown to HTML converter
function markdownToHtml(markdown: string): string {
  // This is a very basic implementation
  // For a real app, you would use a proper markdown parser like marked.js
  let html = markdown
    // Headers
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/^(?!<[hl]|<li)(.+)$/gm, '<p>$1</p>');
  
  // Replace consecutive list items with a proper list
  html = html.replace(/(<li>.+<\/li>\n)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  
  return html;
}
