/**
 * Utility functions for handling mathematical expressions in OCR results
 */

/**
 * Detects and formats mathematical expressions in text
 * @param text The text to process
 * @returns Text with properly formatted mathematical expressions
 */
export function processMathExpressions(text: string): string {
  if (!text) return '';
  
  let processedText = text;
  
  // Process LaTeX-style math expressions
  // Inline math expressions (e.g., $x^2 + y^2 = z^2$)
  processedText = processedText.replace(/\$(.+?)\$/g, (match, expression) => {
    return `$${formatMathExpression(expression)}$`;
  });
  
  // Display math expressions (e.g., $$\frac{1}{2}$$)
  processedText = processedText.replace(/\$\$(.+?)\$\$/g, (match, expression) => {
    return `$$${formatMathExpression(expression)}$$`;
  });
  
  // Process bold numbers (common in financial statements)
  processedText = processedText.replace(/\b(\d{1,3}(?:,\d{3})+(?:\.\d+)?)\b/g, '**$1**');
  processedText = processedText.replace(/\b(\d+\.\d+)\b/g, (match, number) => {
    // Only make it bold if it appears to be a significant financial figure
    // This heuristic can be adjusted based on document context
    if (number.length >= 4 || /^\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(match)) {
      return `**${match}**`;
    }
    return match;
  });
  
  return processedText;
}

/**
 * Formats a mathematical expression for proper rendering
 * @param expression The math expression to format
 * @returns Formatted math expression
 */
function formatMathExpression(expression: string): string {
  // Replace common OCR errors in math expressions
  let formatted = expression
    // Fix common fraction errors
    .replace(/([0-9])\s*\/\s*([0-9])/g, '$1/$2')
    // Fix superscript/exponents
    .replace(/\^\s*([0-9a-zA-Z])/g, '^$1')
    // Fix subscripts
    .replace(/_\s*([0-9a-zA-Z])/g, '_$1')
    // Fix multiplication symbol
    .replace(/([0-9])\s*x\s*([0-9])/gi, '$1\\times $2')
    // Fix square root notation
    .replace(/sqrt\s*\(([^)]+)\)/g, '\\sqrt{$1}')
    // Fix common function names
    .replace(/\b(sin|cos|tan|log|ln)\s*\(/g, '\\$1(');
  
  return formatted;
}

/**
 * Detects if text likely contains mathematical content
 * @param text The text to analyze
 * @returns Boolean indicating if math content is detected
 */
export function containsMathContent(text: string): boolean {
  if (!text) return false;
  
  // Check for common math symbols and patterns
  const mathPatterns = [
    /\$/,                     // LaTeX delimiters
    /\\frac/,                 // Fractions
    /\\sqrt/,                 // Square roots
    /[\^_]{1}[0-9a-zA-Z]/,    // Superscripts/subscripts
    /\\sum|\\prod|\\int/,    // Summation, product, integral
    /\\begin\{equation\}/,    // Equation environments
    /\\begin\{align\}/,       // Alignment environments
    /\\mathbb|\\mathcal/,     // Math alphabets
    /\\left\(|\\right\)/,     // Delimiters
    /\\alpha|\\beta|\\gamma/, // Greek letters
    /\\infty/                 // Infinity symbol
  ];
  
  return mathPatterns.some(pattern => pattern.test(text));
}