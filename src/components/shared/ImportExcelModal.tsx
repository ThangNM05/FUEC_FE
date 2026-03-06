import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { Upload, Download } from 'lucide-react';
import toast from '@/lib/toast';
import { Modal, Button } from 'antd';

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
                toast.error('Please select an Excel file (.xlsx or .xls)');
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
            // Create a temporary link to force download
            const link = document.createElement('a');
            link.href = templateUrl;
            link.download = templateUrl.split('/').pop() || 'template.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            toast.info('Template is being prepared');
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        onClose();
    };

    return (
        <Modal
            title={title}
            open={isOpen}
            onCancel={handleClose}
            width={800}
            footer={[
                <div key="footer-container" className="flex items-center justify-between w-full">
                    <Button
                        key="template"
                        icon={<Download className="w-4 h-4" />}
                        onClick={handleDownloadTemplate}
                        type="link"
                        className="text-gray-600 hover:text-[#F37022]"
                    >
                        Download Template
                    </Button>
                    <div className="flex gap-2">
                        <Button key="cancel" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            key="submit"
                            type="primary"
                            onClick={handleConfirm}
                            className="bg-[#F37022] hover:bg-[#D96419] border-none"
                        >
                            Confirm Import
                        </Button>
                    </div>
                </div>
            ]}
        >
            <div className="py-4">
                <p className="text-sm text-gray-500 mb-6">{description}</p>

                {/* Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${isDragging
                        ? 'border-[#F37022] bg-orange-50 scale-[1.01]'
                        : selectedFile
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-200 hover:border-[#F37022] hover:bg-gray-50'
                        }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    {/* Upload Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${selectedFile ? 'bg-green-500' : 'bg-[#F37022]'}`}>
                            <Upload className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    {/* Text */}
                    {selectedFile ? (
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-green-700">
                                {selectedFile.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                File selected! Click to change.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-lg font-bold text-[#0A1B3C]">
                                Drag & drop or click to upload
                            </p>
                            <p className="text-sm text-gray-500">
                                Supports .xlsx and .xls files
                            </p>
                        </div>
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
            </div>
        </Modal>
    );
}

export default ImportExcelModal;
