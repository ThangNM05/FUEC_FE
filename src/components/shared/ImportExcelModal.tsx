import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { X, Upload, Download } from 'lucide-react';
import toast from '@/lib/toast';

interface ImportExcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (file: File) => void;
    title?: string;
    description?: string;
    templateUrl?: string;
}

function ImportExcelModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Import Data from Excel',
    description = 'Please ensure the data matches the template format',
    templateUrl
}: ImportExcelModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                setSelectedFile(file);
            } else {
                toast.error('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
            }
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                setSelectedFile(file);
            } else {
                toast.error('Please select an Excel file (.xlsx or .xls)');
            }
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleConfirm = () => {
        if (selectedFile) {
            onConfirm(selectedFile);
            setSelectedFile(null);
            onClose();
        } else {
            toast.warning('Please select a file to upload');
        }
    };

    const handleDownloadTemplate = () => {
        if (templateUrl) {
            window.open(templateUrl, '_blank');
        } else {
            toast.info('Template is being prepared');
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Title */}
                <h2 className="text-xl font-bold text-gray-900 mb-1">{title}</h2>
                <p className="text-sm text-gray-600 mb-4">{description}</p>

                {/* Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragging
                        ? 'border-[#F37022] bg-orange-50'
                        : selectedFile
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-300 hover:border-[#F37022] hover:bg-gray-50'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    {/* Upload Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-[#F37022] rounded-full flex items-center justify-center">
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {/* Text */}
                    {selectedFile ? (
                        <>
                            <p className="text-base font-semibold text-green-700 mb-1">
                                {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                Click to select another file
                            </p>
                        </>
                    ) : (
                        <>
                            <p className="text-base font-semibold text-gray-900 mb-1">
                                Drag & drop or click
                            </p>
                            <p className="text-sm text-gray-500">
                                to upload data file
                            </p>
                        </>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center mt-6">
                    {/* Download Template */}
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg transition-colors text-sm font-medium -ml-4"
                    >
                        <Download className="w-4 h-4" />
                        Download Template
                    </button>

                    {/* Cancel & Confirm */}
                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={handleClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-4 py-2 bg-[#F37022] text-white rounded-lg hover:bg-[#D96419] transition-colors text-sm font-medium"
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportExcelModal;
