'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useFileUpload } from '@/lib/hooks/useFileUpload';
import { processFile, formatOcrResult } from '@/lib/services/ocrService';
import { markdownToHtml } from '@/lib/utils/markdownParser';
import './notion-markdown.css';
import CopyableContent from '@/lib/components/CopyableContent';
import Spinner from '@/lib/components/Spinner';

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [markdownResult, setMarkdownResult] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showRendered, setShowRendered] = useState(true);
  const [isAppendMode, setIsAppendMode] = useState(false);
  
  const {
    files,
    filesPreviews,
    error,
    fileInputRef,
    handleFileChange,
    handleDragOver,
    handleDrop,
    triggerFileInput,
    resetForm: resetFileForm,
    removeFile
  } = useFileUpload({ multiple: true, appendMode: isAppendMode });

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setApiError(null);
    
    const response = await processFile(files);
    
    if (response.success && response.result) {
      const fileNames = files.map(file => file.name);
      const newContent = formatOcrResult(response.result, fileNames);
      
      if (isAppendMode && markdownResult) {
        // Append the new content to the existing markdown
        setMarkdownResult(markdownResult + '\n\n---\n\n' + newContent);
      } else {
        // Set as new content
        setMarkdownResult(newContent);
      }
      
      // After successful processing, enable append mode for next uploads
      if (!isAppendMode) {
        setIsAppendMode(true);
      }
      
      // Clear the files after processing to avoid duplicate work
      resetFileForm();
    } else if (response.error) {
      setApiError(response.error);
    }
    
    setIsUploading(false);
  };

  const resetForm = () => {
    resetFileForm();
    setMarkdownResult(null);
    setApiError(null);
    setIsAppendMode(false);
  };

  const toggleMarkdownView = () => {
    setShowRendered(!showRendered);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-12 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-8 md:mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">AI OCR Tool</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Upload an image or PDF to extract content as markdown</p>
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
              multiple={true}
            />
            <Image
              src="/upload.svg"
              alt="Upload"
              width={64}
              height={64}
              className="mb-6 text-gray-400"
            />
            <p className="text-center mb-3 text-lg">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Drag & drop your files here or click to browse'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Supports JPEG, PNG, and PDF files
            </p>
            {(error || apiError) && (
              <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error || apiError}</p>
            )}
          </div>
          
          {files.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Selected Files:</h3>
              <div className="space-y-2">
                {filesPreviews.map((filePreview, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <div className="flex items-center">
                      {filePreview.preview ? (
                        <Image 
                          src={filePreview.preview} 
                          alt={filePreview.file.name} 
                          width={40} 
                          height={40} 
                          className="mr-3 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 mr-3 flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded">
                          <span className="text-xs">PDF</span>
                        </div>
                      )}
                      <span className="text-sm truncate max-w-xs">{filePreview.file.name}</span>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                {isUploading ? (
                  <span className="flex items-center justify-center">
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </span>
                ) : 'Process File'}
              </button>
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-lg"
              >
                Reset
              </button>
            </div>
          )}
          
          {markdownResult && files.length === 0 && (
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setIsAppendMode(true);
                  triggerFileInput();
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-lg font-medium flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Append a new file
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
                <CopyableContent content={markdownResult}>
                  <div className="notion-like" dangerouslySetInnerHTML={{ __html: markdownToHtml(markdownResult) }} />
                </CopyableContent>
              ) : (
                <CopyableContent content={markdownResult}>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded overflow-auto max-h-96 font-mono text-sm whitespace-pre-wrap">
                    {markdownResult}
                  </div>
                </CopyableContent>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-12 md:mt-16 text-center text-sm text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
        <p>AI OCR Tool - Powered by Next.js and Mistral AI</p>
        <p className="mt-1">
          Created by <a href="https://www.pedrolaracuente.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 transition-colors">Pedro Laracuente</a>
        </p>
      </footer>
    </div>
  );
}
