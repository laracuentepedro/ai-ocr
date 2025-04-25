/**
 * Markdown parser utility functions for converting markdown to HTML
 * Includes support for basic markdown elements and tables
 */

/**
 * Converts markdown text to HTML
 * @param markdown The markdown text to convert
 * @returns HTML string
 */
// Import MathJax script for rendering LaTeX expressions
if (typeof document !== 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Process LaTeX-style math expressions in HTML
 * @param html The HTML content to process
 * @returns HTML with properly formatted math expressions
 */
function processMathExpressions(html: string): string {
  if (!html) return '';
  
  // Process inline math expressions ($...$)
  html = html.replace(/\$([^$\n]+?)\$/g, (match, expression) => {
    return `<span class="math-inline">\\(${expression}\\)</span>`;
  });
  
  // Process display math expressions ($$...$$)
  html = html.replace(/\$\$([^$]+?)\$\$/g, (match, expression) => {
    return `<div class="math-display">\\[${expression}\\]</div>`;
  });
  
  return html;
}

export function markdownToHtml(markdown: string): string {
  // This is a basic implementation with table support added
  // For a production app, consider using a proper markdown parser like marked.js
  
  // Process tables first (before other replacements)
  let html = markdown;
  
  // Table detection and processing
  // Look for patterns like: | Column1 | Column2 | Column3 |
  // followed by | :-- | :-- | :-- | or similar separator row
  // followed by data rows
  html = processMarkdownTables(html);
  
  // Process other markdown elements
  html = html
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
    // Blockquotes
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    // Paragraphs (excluding tables and other HTML elements)
    .replace(/^(?!<[htlb]|<li|<table|<blockquote)(.+)$/gm, '<p>$1</p>');
  
  // Replace consecutive list items with a proper list
  html = html.replace(/(<li>.+<\/li>\n)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  
  // Process math expressions after other markdown processing
  html = processMathExpressions(html);
  
  // Add MathJax configuration to trigger rendering
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      // @ts-ignore - MathJax is loaded via CDN
      if (window.MathJax) {
        // @ts-ignore
        window.MathJax.typeset();
      }
    }, 100);
  }
  
  return html;
}

/**
 * Process markdown tables and convert them to HTML tables
 * @param markdown The markdown text containing tables
 * @returns Markdown with tables converted to HTML
 */
function processMarkdownTables(markdown: string): string {
  // Find table blocks in the markdown
  // A table block starts with a line containing | characters
  // followed by a separator line with dashes and optional colons for alignment
  // followed by more lines with | characters
  
  // Regular expression to match markdown tables - more flexible version
  // This regex is more forgiving with whitespace and newlines
  const tableRegex = /^\s*\|(.+?)\|\s*$[\r\n]+^\s*\|([-:\|\s]+?)\|\s*$[\r\n]+((?:^\s*\|.+?\|\s*$[\r\n]*)+)/gm;
  
  return markdown.replace(tableRegex, (match, headerRow, separatorRow, bodyRows) => {
    // Process the header row
    const headers = headerRow.split('|').map((cell: string) => cell.trim()).filter((cell: string) => cell !== '');
    
    // Process the separator row to determine alignment
    const alignments = separatorRow.split('|').map((cell: string) => {
      cell = cell.trim();
      if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
      if (cell.endsWith(':')) return 'right';
      return 'left';
    }).filter((cell: string) => cell !== '');
    
    // Process the body rows
    const rows = bodyRows.trim().split('\n').map((row: string) => {
      // Remove the first and last empty cells (from the outer pipe characters)
      const cells = row.split('|');
      // Remove first and last elements if they're empty (from the outer pipes)
      if (cells.length > 0 && cells[0].trim() === '') cells.shift();
      if (cells.length > 0 && cells[cells.length - 1].trim() === '') cells.pop();
      return cells.map((cell: string) => cell.trim());
    });
    
    // Build the HTML table
    let tableHtml = '<table>\n<thead>\n<tr>\n';
    
    // Add header cells
    headers.forEach((header: string, index: number) => {
      const alignment = alignments[index] || 'left';
      tableHtml += `<th style="text-align: ${alignment}">${header}</th>\n`;
    });
    
    tableHtml += '</tr>\n</thead>\n<tbody>\n';
    
    // Add body rows
    rows.forEach((row: string[]) => {
      tableHtml += '<tr>\n';
      row.forEach((cell, index) => {
        const alignment = alignments[index] || 'left';
        tableHtml += `<td style="text-align: ${alignment}">${cell}</td>\n`;
      });
      tableHtml += '</tr>\n';
    });
    
    tableHtml += '</tbody>\n</table>';
    
    return tableHtml;
  });
}