'use client';

import { ReactNode, useState } from 'react';
import { copyToClipboard } from '@/lib/utils/clipboard';
import Toast from './Toast';

type CopyableContentProps = {
  children: ReactNode;
  content: string;
  className?: string;
};

export default function CopyableContent({ children, content, className = '' }: CopyableContentProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleCopy = async () => {
    const success = await copyToClipboard(content);
    
    if (success) {
      setToastMessage('Content copied to clipboard!');
    } else {
      setToastMessage('Failed to copy content');
    }
    
    setShowToast(true);
  };

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Copy to clipboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
      {children}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastMessage.includes('Failed') ? 'error' : 'success'}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}