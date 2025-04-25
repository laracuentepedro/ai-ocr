'use client';

import { useState } from 'react';

export default function MathInfo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-2 text-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-blue-600 hover:text-blue-800 flex items-center"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 mr-1 transition-transform ${isOpen ? 'rotate-90' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span>About mathematical expressions and formulas</span>
      </button>
      
      {isOpen && (
        <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="font-medium mb-2">How to use mathematical expressions:</h4>
          <ul className="list-disc pl-5 space-y-1">
            <li>Inline math: Use single dollar signs like <code>$x^2 + y^2 = z^2$</code></li>
            <li>Display math: Use double dollar signs like <code>$$\frac{1}{2}$$</code></li>
            <li>Financial numbers are automatically detected and formatted in bold</li>
          </ul>
          <p className="mt-2">Switch to the <strong>Rendered</strong> view to see properly formatted equations.</p>
        </div>
      )}
    </div>
  );
}