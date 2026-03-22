import { useState, useRef } from 'react';
import { Upload, X, FolderOpen, File } from 'lucide-react';

interface UploadedFile {
    name: string;
    path: string;
    size: number;
    type: string;
    file: File;
}

interface FileUploaderProps {
    onFilesChange: (files: UploadedFile[]) => void;
    accept?: string;
    isCompact?: boolean;
}

function FileUploader({ onFilesChange, accept, isCompact }: FileUploaderProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const processFiles = (fileList: FileList | null) => {
        if (!fileList) return;

        const newFiles: UploadedFile[] = [];
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const uploadedFile: UploadedFile = {
                name: file.name,
                path: (file as any).webkitRelativePath || file.name,
                size: file.size,
                type: file.type,
                file: file
            };
            newFiles.push(uploadedFile);
        }

        const updatedFiles = [...files, ...newFiles];
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        processFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const removeAll = () => {
        setFiles([]);
        onFilesChange([]);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg text-center transition-all ${isCompact ? 'p-4 md:p-6' : 'p-8 md:p-12'} ${isDragging
                    ? 'border-[#F37022] bg-orange-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }`}
            >
                <Upload className={`${isCompact ? 'w-8 h-8' : 'w-12 h-12'} mx-auto mb-3 ${isDragging ? 'text-[#F37022]' : 'text-gray-400'}`} />
                <h3 className={`${isCompact ? 'text-sm font-bold' : 'text-lg font-semibold'} text-[#0A1B3C] mb-1`}>
                    {isDragging ? 'Drop here' : 'Drag & Drop Files'}
                </h3>
                <p className="text-[10px] text-gray-500 mb-3 uppercase tracking-wider font-semibold">or</p>
                <div className={`flex flex-wrap items-center justify-center gap-2 ${isCompact ? 'px-2' : ''}`}>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex-1 min-w-[100px] ${isCompact ? 'py-2' : 'px-4 py-2'} bg-orange-50 text-[#F37022] border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-xs font-bold flex items-center justify-center gap-1.5`}
                    >
                        <File className="w-3.5 h-3.5" />
                        Files
                    </button>
                    <button
                        onClick={() => folderInputRef.current?.click()}
                        className={`flex-1 min-w-[100px] ${isCompact ? 'py-2' : 'px-4 py-2'} bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold flex items-center justify-center gap-1.5`}
                    >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Folder
                    </button>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={accept}
                    onChange={handleFileChange}
                    className="hidden"
                />
                <input
                    ref={folderInputRef}
                    type="file"
                    {...({ webkitdirectory: '', directory: '' } as any)}
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-[#0A1B3C]">
                            Files ({files.length})
                        </h4>
                        <button
                            onClick={removeAll}
                            className="text-[10px] text-red-600 hover:text-red-700 font-bold"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <File className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-bold text-gray-700 truncate">
                                            {file.path}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-1 hover:bg-red-100 rounded-md transition-colors flex-shrink-0"
                                >
                                    <X className="w-3.5 h-3.5 text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default FileUploader;
