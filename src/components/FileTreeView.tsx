import { useState } from 'react';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    size?: number;
    children?: FileNode[];
}

interface FileTreeViewProps {
    files: FileNode[];
    onFileClick?: (file: FileNode) => void;
    selectedPath?: string;
}

function FileTreeView({ files, onFileClick, selectedPath }: FileTreeViewProps) {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

    const toggleFolder = (path: string) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedFolders(newExpanded);
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const renderNode = (node: FileNode, level: number = 0) => {
        const isFolder = node.type === 'folder';
        const isExpanded = expandedFolders.has(node.path);
        const isSelected = node.path === selectedPath;

        return (
            <div key={node.path}>
                <div
                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors ${isSelected ? 'bg-orange-50 border-l-2 border-[#F37022]' : ''
                        }`}
                    style={{ paddingLeft: `${level * 20 + 12}px` }}
                    onClick={() => {
                        if (isFolder) {
                            toggleFolder(node.path);
                        } else if (onFileClick) {
                            onFileClick(node);
                        }
                    }}
                >
                    {isFolder ? (
                        <>
                            {isExpanded ? (
                                <ChevronDown className="w-4 h-4 flex-shrink-0 text-gray-600" />
                            ) : (
                                <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-600" />
                            )}
                            <Folder className="w-4 h-4 flex-shrink-0 text-blue-600" />
                        </>
                    ) : (
                        <File className="w-4 h-4 flex-shrink-0 text-gray-600 ml-4" />
                    )}
                    <span className={`text-sm flex-1 truncate ${isSelected ? 'font-semibold text-[#F37022]' : 'text-gray-700'}`}>
                        {node.name}
                    </span>
                    {node.size && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                            {formatFileSize(node.size)}
                        </span>
                    )}
                </div>

                {isFolder && isExpanded && node.children && (
                    <div>
                        {node.children.map(child => renderNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-3 border-b border-gray-200 bg-gray-50">
                <h3 className="font-semibold text-sm text-[#0A1B3C]">Files</h3>
            </div>
            <div className="overflow-y-auto max-h-96">
                {files.length === 0 ? (
                    <p className="text-center py-8 text-sm text-gray-500">No files</p>
                ) : (
                    files.map(file => renderNode(file))
                )}
            </div>
        </div>
    );
}

export default FileTreeView;
