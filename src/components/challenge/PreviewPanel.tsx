'use client';

import { useMemo } from 'react';
import { Globe } from 'lucide-react';

interface PreviewPanelProps {
  code: string;
  language: string;
}

export default function PreviewPanel({ code, language }: PreviewPanelProps) {
  const srcDoc = useMemo(() => {
    if (!code.trim()) return '';

    if (language === 'html') {
      return code;
    }

    // Wrap JavaScript code in an HTML page that captures output
    return `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      background: #fff;
      color: #1a1a1a;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      padding: 12px;
      margin: 0;
    }
    .output-line { margin: 2px 0; }
    .error { color: #dc2626; }
    .warn { color: #d97706; }
    pre { margin: 0; white-space: pre-wrap; word-break: break-all; }
  </style>
</head>
<body>
  <div id="output"></div>
  <script>
    const output = document.getElementById('output');
    function appendOutput(text, className) {
      const div = document.createElement('div');
      div.className = 'output-line' + (className ? ' ' + className : '');
      const pre = document.createElement('pre');
      pre.textContent = typeof text === 'string' ? text : JSON.stringify(text, null, 2);
      div.appendChild(pre);
      output.appendChild(div);
    }
    const origLog = console.log;
    console.log = (...args) => { args.forEach(a => appendOutput(a)); origLog.apply(console, args); };
    console.warn = (...args) => { args.forEach(a => appendOutput(a, 'warn')); };
    console.error = (...args) => { args.forEach(a => appendOutput(a, 'error')); };
    try {
      ${code}
    } catch(e) {
      appendOutput('Error: ' + e.message, 'error');
    }
  </script>
</body>
</html>`;
  }, [code, language]);

  if (!code.trim()) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-600">
        <Globe className="w-8 h-8 mb-2" />
        <p className="text-sm">Write and run code to see preview</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden" style={{ minHeight: 200 }}>
      <iframe
        srcDoc={srcDoc}
        sandbox="allow-scripts"
        className="w-full border-0"
        style={{ minHeight: 200 }}
        title="Code Preview"
      />
    </div>
  );
}
