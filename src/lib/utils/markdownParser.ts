/**
 * Markdown parser utility functions for converting markdown to HTML
 * Includes support for basic markdown elements and tables
 */

/**
 * Converts markdown text to HTML
 * @param markdown The markdown text to convert
 * @returns HTML string
 */
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
    // Paragraphs (excluding tables and other HTML elements)
    .replace(/^(?!<[htl]|<li|<table)(.+)$/gm, '<p>$1</p>');
  
  // Replace consecutive list items with a proper list
  html = html.replace(/(<li>.+<\/li>\n)+/g, (match) => {
    return `<ul>${match}</ul>`;
  });
  
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