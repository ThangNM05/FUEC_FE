import { useState, useEffect } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import CodeViewer from './CodeViewer';

interface MaterialFilePreviewProps {
    url: string;
    name: string;
}

const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'];
const CODE_EXTS = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'html', 'css', 'json', 'xml', 'sql', 'sh', 'yml', 'yaml', 'rb', 'go', 'rs', 'php', 'swift', 'kt', 'h', 'hpp'];
const TEXT_EXTS = ['txt', 'md', 'log', 'csv', 'ini', 'cfg', 'conf'];
const OFFICE_EXTS = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
const ARCHIVE_EXTS = ['zip', 'rar', '7z'];

function getFileType(filename: string) {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (IMAGE_EXTS.includes(ext)) return 'image';
    if (CODE_EXTS.includes(ext)) return 'code';
    if (TEXT_EXTS.includes(ext)) return 'text';
    if (OFFICE_EXTS.includes(ext)) return 'office';
    if (ARCHIVE_EXTS.includes(ext)) return 'archive';
    return 'unknown';
}

function MaterialFilePreview({ url, name }: MaterialFilePreviewProps) {
    const [textContent, setTextContent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fileType = getFileType(name);
    const isBlobUrl = url.startsWith('blob:');

    useEffect(() => {
        setLoading(true);
        setError('');
        setTextContent('');

        if (fileType === 'code' || fileType === 'text') {
            fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to load');
                    return res.text();
                })
                .then(text => setTextContent(text))
                .catch(() => setError('Failed to load file content'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [url, fileType]);

    if (loading) {
        return (
            <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg">
                <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: '#F37022' }} spin />} tip="Loading..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-red-500">
                    <FileText className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // Image
    if (fileType === 'image') {
        return (
            <div className="flex items-center justify-center bg-gray-50 border rounded-lg p-4 min-h-[400px]">
                <img src={url} alt={name} className="max-w-full max-h-[800px] object-contain rounded shadow-sm" />
            </div>
        );
    }

    // PDF
    if (fileType === 'pdf') {
        return <iframe src={url} className="w-full h-[800px] border rounded-lg" title={name} />;
    }

    // Office (only works with public URLs, not blob URLs)
    if (fileType === 'office' && !isBlobUrl) {
        return (
            <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`}
                className="w-full h-[800px] border rounded-lg"
                title={name}
            />
        );
    }

    // Code files
    if (fileType === 'code' && textContent) {
        return (
            <div className="border rounded-lg overflow-hidden h-[700px]">
                <CodeViewer code={textContent} language="" filename={name} />
            </div>
        );
    }

    // Text files
    if (fileType === 'text' && textContent) {
        return (
            <div className="bg-white border rounded-lg p-6 max-h-[700px] overflow-auto">
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">{textContent}</pre>
            </div>
        );
    }

    // Unknown / unsupported
    return (
        <div className="w-full h-[300px] bg-gray-50 border rounded-lg flex flex-col items-center justify-center text-gray-500 gap-4">
            <FileText className="w-12 h-12 text-gray-300" />
            <p className="text-sm font-medium">Preview not available for this file type</p>
            <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#F37022] text-white rounded-lg text-sm font-medium hover:bg-[#d95f19] transition-colors"
            >
                Open in new tab
            </a>
        </div>
    );
}

export default MaterialFilePreview;
