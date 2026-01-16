import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeViewerProps {
    code: string;
    language: string;
    filename: string;
}

function CodeViewer({ code, language, filename }: CodeViewerProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Auto-detect language from filename
    const getLanguage = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase();
        const languageMap: Record<string, string> = {
            js: 'javascript',
            jsx: 'jsx',
            ts: 'typescript',
            tsx: 'tsx',
            py: 'python',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            cs: 'csharp',
            html: 'html',
            css: 'css',
            json: 'json',
            xml: 'xml',
            sql: 'sql',
            md: 'markdown',
            sh: 'bash',
            yml: 'yaml',
            yaml: 'yaml',
        };
        return languageMap[ext || ''] || 'plaintext';
    };

    const detectedLanguage = language || getLanguage(filename);

    return (
        <div className="h-full flex flex-col bg-[#1e1e1e]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#252526] border-b border-gray-700">
                <div>
                    <h3 className="text-sm font-medium text-white">{filename}</h3>
                    <p className="text-xs text-gray-400">{detectedLanguage}</p>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#0e639c] text-white rounded hover:bg-[#1177bb] transition-colors text-sm"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy
                        </>
                    )}
                </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto">
                <SyntaxHighlighter
                    language={detectedLanguage}
                    style={vscDarkPlus}
                    showLineNumbers
                    customStyle={{
                        margin: 0,
                        padding: '1rem',
                        background: '#1e1e1e',
                        fontSize: '14px',
                    }}
                    lineNumberStyle={{
                        minWidth: '3em',
                        paddingRight: '1em',
                        color: '#858585',
                        userSelect: 'none',
                    }}
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}

export default CodeViewer;
