import React from 'react';

const AnsiToHtml: React.FC<{ text: string }> = ({ text }) => {
  const colorMap: { [key: string]: string } = {
    '30': 'var(--muted-foreground)',
    '31': 'var(--destructive)',
    '32': 'var(--chart-2)',
    '33': 'var(--chart-4)',
    '34': 'var(--primary)',
    '35': 'var(--chart-5)',
    '36': 'var(--chart-1)',
    '37': 'var(--foreground)',
    '90': 'var(--muted-foreground)',
    '91': 'var(--destructive)',
    '92': 'var(--chart-2)',
    '93': 'var(--chart-4)',
    '94': 'var(--primary)',
    '95': 'var(--chart-5)',
    '96': 'var(--chart-1)',
    '97': 'var(--foreground)',
  };

  const processAnsi = (inputText: string) => {
    // Regular expression to split the string by ANSI escape codes.
    const ansiRegex = /(\u001b\[(\d{1,2})m)/g;
    const parts = inputText.split(ansiRegex);
    let currentColor: string | null = null;
    const elements: (string | JSX.Element)[] = [];
    let key = 0;

    for (let i = 0; i < parts.length; i++) {
      // The parts array is structured as [text, full_match, code, text, ...].
      // We are interested in the text parts (even indices) and the codes (odd indices' corresponding code).
      const isAnsiCode = i % 3 === 1;

      if (isAnsiCode) {
        const code = parts[i + 1];
        if (code === '0') {
          currentColor = null;
        } else if (colorMap[code]) {
          currentColor = colorMap[code];
        }
      } else if (i % 3 === 0 && parts[i]) {
        elements.push(
          <span key={key++} style={{ color: currentColor ? `hsl(${currentColor})` : 'inherit' }}>
            {parts[i]}
          </span>
        );
      }
    }
    return elements;
  };

  return <>{processAnsi(text)}</>;
};

export default AnsiToHtml;
