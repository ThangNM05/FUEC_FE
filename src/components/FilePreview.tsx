import { useState, useEffect } from 'react';
import { FileText, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import CodeViewer from './CodeViewer';
import mammoth from 'mammoth';

interface FilePreviewProps {
    file: File;
    filename: string;
}

function FilePreview({ file, filename }: FilePreviewProps) {
    const [fileContent, setFileContent] = useState<string>('');
    const [fileUrl, setFileUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadFile();
        return () => {
            if (fileUrl) URL.revokeObjectURL(fileUrl);
        };
    }, [file]);

    const loadFile = async () => {
        setLoading(true);
        setError('');

        try {
            const fileType = getFileType(filename);

            if (fileType === 'image' || fileType === 'pdf') {
                const url = URL.createObjectURL(file);
                setFileUrl(url);
            } else if (fileType === 'code' || fileType === 'text') {
                const text = await file.text();
                setFileContent(text);
            } else if (fileType === 'docx') {
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                setFileContent(result.value);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load file');
        } finally {
            setLoading(false);
        }
    };

    const getFileType = (filename: string): string => {
        const ext = filename.split('.').pop()?.toLowerCase();

        const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'bmp', 'webp'];
        const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'html', 'css', 'json', 'xml', 'sql'];
        const textExts = ['txt', 'md', 'log'];

        if (ext === 'pdf') return 'pdf';
        if (imageExts.includes(ext || '')) return 'image';
        if (codeExts.includes(ext || '')) return 'code';
        if (textExts.includes(ext || '')) return 'text';
        if (ext === 'docx') return 'docx';

        return 'unknown';
    };

    const fileType = getFileType(filename);

    if (loading) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <Spin indicator={antIcon} tip="Loading file..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center text-red-600">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-medium">Error loading file</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // PDF Preview
    if (fileType === 'pdf') {
        return (
            <div className="h-full bg-gray-900">
                <iframe
                    src={fileUrl}
                    className="w-full h-full border-0"
                    title={filename}
                />
            </div>
        );
    }

    // Image Preview
    if (fileType === 'image') {
        return (
            <div className="h-full bg-gray-100 flex items-center justify-center p-4 overflow-auto">
                <img
                    src={fileUrl}
                    alt={filename}
                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                />
            </div>
        );
    }

    // Code Preview
    if (fileType === 'code') {
        return <CodeViewer code={fileContent} language="" filename={filename} />;
    }

    // Text Preview
    if (fileType === 'text') {
        return (
            <div className="h-full bg-white p-6 overflow-auto">
                <h3 className="text-lg font-semibold text-[#0A1B3C] mb-4">{filename}</h3>
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                    {fileContent}
                </pre>
            </div>
        );
    }

    // DOCX Preview
    if (fileType === 'docx') {
        return (
            <div className="h-full bg-white p-6 overflow-auto">
                <h3 className="text-lg font-semibold text-[#0A1B3C] mb-4">{filename}</h3>
                <div
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: fileContent }}
                />
            </div>
        );
    }

    // Unknown file type
    return (
        <div className="h-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">Preview not available</p>
                <p className="text-sm text-gray-500 mb-4">
                    {filename} ({file.type || 'unknown type'})
                </p>
                <a
                    href={URL.createObjectURL(file)}
                    download={filename}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#F37022] text-white rounded-lg hover:bg-[#D96419] transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Download File
                </a>
            </div>
        </div>
    );
}

export default FilePreview;
