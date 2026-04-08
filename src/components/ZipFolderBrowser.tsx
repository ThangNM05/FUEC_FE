import { useState } from 'react';
import { toast } from 'sonner';
import {
    FileText, Download, Eye, Loader2, FolderOpen, FolderClosed, ChevronDown, Trash2
} from 'lucide-react';
import type { CourseMaterial } from '@/types/courseMaterial.types';

interface ArchiveEntry {
    name: string;
    fullPath: string;
    size: number;
    isDirectory: boolean;
    lastModified?: string;
}

interface ZipFolderBrowserProps {
    material: CourseMaterial;
    onDelete: (materialId: string, fileName?: string) => void;
    onPreviewFile: (url: string, name: string) => void;
}

const PREVIEWABLE_EXTS = [
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf',
    'txt', 'md', 'log', 'json', 'xml', 'csv',
    'html', 'css', 'js', 'jsx', 'ts', 'tsx',
    'py', 'java', 'cpp', 'c', 'cs', 'sql',
    'sh', 'yml', 'yaml', 'rb', 'go', 'rs', 'php',
    'doc', 'docx', 'h', 'hpp',
];

function getS3Key(fileUrl: string) {
    const s3Url = new URL(fileUrl);
    return s3Url.pathname.substring(1);
}

function getApiBase() {
    return import.meta.env.VITE_API_URL || '';
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function formatFileSize(bytes: number) {
    if (bytes === 0) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPreviewable(fileName: string) {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return PREVIEWABLE_EXTS.includes(ext);
}

function ZipFolderBrowser({ material, onDelete, onPreviewFile }: ZipFolderBrowserProps) {
    const [expanded, setExpanded] = useState(false);
    const [entries, setEntries] = useState<ArchiveEntry[] | null>(null);
    const [loading, setLoading] = useState(false);

    const toggleExpand = async () => {
        if (expanded) {
            setExpanded(false);
            return;
        }

        setExpanded(true);

        if (entries) return;

        setLoading(true);
        try {
            const key = getS3Key(material.fileUrl!);
            const res = await fetch(
                `${getApiBase()}/Files/archive-entries?key=${encodeURIComponent(key)}`,
                { headers: getAuthHeaders() }
            );
            if (!res.ok) throw new Error('Failed to read archive');
            const data = await res.json();
            setEntries(data.result || []);
        } catch {
            toast.error('Cannot read archive contents');
            setExpanded(false);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadAll = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const key = getS3Key(material.fileUrl!);
            const res = await fetch(
                `${getApiBase()}/Files/download?key=${encodeURIComponent(key)}`,
                { headers: getAuthHeaders() }
            );
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = material.fileName || 'download.zip';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to download file');
        }
    };

    const handleDownloadEntry = async (entryPath: string, fileName: string) => {
        try {
            const key = getS3Key(material.fileUrl!);
            const res = await fetch(
                `${getApiBase()}/Files/archive-entry-download?key=${encodeURIComponent(key)}&entryPath=${encodeURIComponent(entryPath)}`,
                { headers: getAuthHeaders() }
            );
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            toast.error('Failed to download file');
        }
    };

    const handlePreviewEntry = async (entryPath: string, fileName: string) => {
        try {
            const key = getS3Key(material.fileUrl!);
            const res = await fetch(
                `${getApiBase()}/Files/archive-entry-download?key=${encodeURIComponent(key)}&entryPath=${encodeURIComponent(entryPath)}`,
                { headers: getAuthHeaders() }
            );
            if (!res.ok) throw new Error('Failed to fetch');
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            onPreviewFile(blobUrl, fileName);
        } catch {
            toast.error('Failed to preview file');
        }
    };

    const filteredEntries = entries?.filter(e => e.name) || [];
    const fileCount = filteredEntries.filter(e => !e.isDirectory).length;

    return (
        <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
            {/* Header row */}
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer group gap-3"
                onClick={() => material.fileUrl && toggleExpand()}
            >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-amber-100 text-amber-600">
                        {expanded ? <FolderOpen className="w-5 h-5" /> : <FolderClosed className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[#0A1B3C] truncate">
                                {material.fileName || 'Unnamed archive'}
                            </p>
                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`} />
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Uploaded {new Date(material.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            <span className="ml-2 uppercase font-medium text-amber-500">Archive</span>
                            {entries && <span className="ml-2 text-gray-400">• {fileCount} files</span>}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-14 sm:ml-0" onClick={e => e.stopPropagation()}>
                    {material.fileUrl && (
                        <button
                            onClick={handleDownloadAll}
                            className="px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1.5"
                            title="Download All"
                        >
                            <Download className="w-4 h-4" />
                            Download All
                        </button>
                    )}
                    <button
                        onClick={() => onDelete(material.id, material.fileName)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Expanded entries */}
            {expanded && (
                <div className="border-t border-gray-100 bg-gray-50/50">
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="w-5 h-5 text-[#F37022] animate-spin mr-2" />
                            <span className="text-sm text-gray-500">Reading archive...</span>
                        </div>
                    ) : fileCount === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-400">Empty archive</div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredEntries.map((entry, i) => {
                                if (entry.isDirectory) {
                                    return (
                                        <div key={i} className="flex items-center px-6 py-2 text-sm bg-gray-50">
                                            <FolderClosed className="w-4 h-4 text-amber-500 mr-2 flex-shrink-0" />
                                            <span className="font-medium text-gray-600 truncate">{entry.fullPath}</span>
                                        </div>
                                    );
                                }
                                const canPreview = isPreviewable(entry.name);
                                return (
                                    <div key={i} className="flex items-center px-6 py-2.5 text-sm hover:bg-white transition-colors group/entry">
                                        <FileText className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                        <span className="flex-1 text-gray-700 truncate" title={entry.fullPath}>
                                            {entry.fullPath}
                                        </span>
                                        <span className="text-xs text-gray-400 mr-3 flex-shrink-0">
                                            {formatFileSize(entry.size)}
                                        </span>
                                        <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover/entry:opacity-100 transition-opacity">
                                            {canPreview && (
                                                <button
                                                    onClick={() => handlePreviewEntry(entry.fullPath, entry.name)}
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                                                    title="Preview"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDownloadEntry(entry.fullPath, entry.name)}
                                                className="p-1.5 text-green-500 hover:bg-green-50 rounded-md transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ZipFolderBrowser;
