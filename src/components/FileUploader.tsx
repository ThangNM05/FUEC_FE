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
}

function FileUploader({ onFilesChange, accept }: FileUploaderProps) {
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
                className={`border-2 border-dashed rounded-lg p-8 md:p-12 text-center transition-all ${isDragging
                        ? 'border-[#F37022] bg-orange-50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                    }`}
            >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-[#F37022]' : 'text-gray-400'}`} />
                <h3 className="text-lg font-semibold text-[#0A1B3C] mb-2">
                    {isDragging ? 'Drop files here' : 'Drag & Drop Files or Folders'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">or</p>
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#F37022] text-white rounded-lg hover:bg-[#D96419] transition-colors text-sm font-medium"
                    >
                        <File className="w-4 h-4 inline mr-2" />
                        Browse Files
                    </button>
                    <button
                        onClick={() => folderInputRef.current?.click()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <FolderOpen className="w-4 h-4 inline mr-2" />
                        Browse Folder
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
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-[#0A1B3C]">
                            Uploaded Files ({files.length})
                        </h4>
                        <button
                            onClick={removeAll}
                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                        >
                            Remove All
                        </button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <File className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.path}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                                >
                                    <X className="w-4 h-4 text-red-600" />
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
