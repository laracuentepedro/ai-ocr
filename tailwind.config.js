/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      typography: {
        DEFAULT: {
          css: {
            lineHeight: '1.6',
            letterSpacing: '-0.011em',
            maxWidth: '100%',
            h1: {
              fontWeight: '600',
              fontSize: '2.125em',
              lineHeight: '1.2',
              marginTop: '1.4em',
              marginBottom: '0.5em',
            },
            h2: {
              fontWeight: '600',
              fontSize: '1.625em',
              lineHeight: '1.3',
              marginTop: '1.4em',
              marginBottom: '0.5em',
            },
            h3: {
              fontWeight: '600',
              fontSize: '1.25em',
              lineHeight: '1.3',
              marginTop: '1.4em',
              marginBottom: '0.5em',
            },
            p: {
              marginBottom: '0.5em',
              padding: '3px 2px',
            },
          },
        },
      },
    },
  },
  plugins: [],
};