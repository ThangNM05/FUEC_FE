import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { Modal, Button, InputNumber } from 'antd';
import toast from '@/lib/toast';

interface ImportGiftModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (file: File, defaultChapter?: number) => void;
    title?: string;
    description?: string;
}

function ImportGiftModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Import Questions from GIFT File',
    description = 'Upload a GIFT format file (.gift or .txt). Optionally set a default chapter for all questions.',
}: ImportGiftModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [defaultChapter, setDefaultChapter] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const isValidFile = (file: File) =>
        file.name.endsWith('.gift') || file.name.endsWith('.txt');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (isValidFile(file)) {
            setSelectedFile(file);
        } else {
            toast.error('Please select a GIFT file (.gift or .txt)');
        }
        // Reset input so the same file can be re-selected
        e.target.value = '';
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
        if (!file) return;
        if (isValidFile(file)) {
            setSelectedFile(file);
        } else {
            toast.error('Please select a GIFT file (.gift or .txt)');
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleConfirm = () => {
        if (!selectedFile) {
            toast.warning('Please select a file to upload');
            return;
        }
        onConfirm(selectedFile, defaultChapter ?? undefined);
        handleClose();
    };

    const handleClose = () => {
        setSelectedFile(null);
        setDefaultChapter(null);
        onClose();
    };

    return (
        <Modal
            title={title}
            open={isOpen}
            onCancel={handleClose}
            width={640}
            footer={[
                <div key="footer-container" className="flex items-center justify-end gap-2 w-full">
                    <Button key="cancel" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleConfirm}
                        className="bg-[#F37022] hover:bg-[#D96419] border-none"
                    >
                        Preview Import
                    </Button>
                </div>,
            ]}
        >
            <div className="py-4 space-y-5">
                <p className="text-sm text-gray-500">{description}</p>

                {/* Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                        isDragging
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
                    <div className="flex justify-center mb-5">
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                                selectedFile ? 'bg-green-500' : 'bg-[#F37022]'
                            }`}
                        >
                            <Upload className="w-8 h-8 text-white" />
                        </div>
                    </div>

                    {selectedFile ? (
                        <div className="space-y-1">
                            <p className="text-base font-bold text-green-700">{selectedFile.name}</p>
                            <p className="text-sm text-gray-500">
                                {(selectedFile.size / 1024).toFixed(1)} KB · Click to change
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-base font-bold text-[#0A1B3C]">
                                Drag & drop or click to upload
                            </p>
                            <p className="text-sm text-gray-500">Supports .gift and .txt (GIFT format)</p>
                        </div>
                    )}

                    {/* Hidden file input */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".gift,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* Default Chapter (optional) */}
                <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                        Default Chapter
                        <span className="ml-1 text-gray-400 font-normal">(optional)</span>
                    </label>
                    <InputNumber
                        min={1}
                        max={999}
                        value={defaultChapter}
                        onChange={(val) => setDefaultChapter(val)}
                        placeholder="e.g. 1"
                        className="w-32"
                    />
                    <span className="text-xs text-gray-400">
                        Applied to questions that don't already specify a chapter.
                    </span>
                </div>

                {/* Format hint */}
                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700 space-y-1">
                    <p className="font-semibold">GIFT Format Tips</p>
                    <ul className="list-disc list-inside space-y-0.5 text-blue-600">
                        <li>Each question block is separated by a blank line.</li>
                        <li>Correct answers are prefixed with <code className="bg-blue-100 px-1 rounded">=</code>, wrong with <code className="bg-blue-100 px-1 rounded">~</code>.</li>
                        <li>Optional tags: <code className="bg-blue-100 px-1 rounded">::tag::</code> before the question stem.</li>
                        <li>Optional chapter header: <code className="bg-blue-100 px-1 rounded">// Chapter: N</code> line above a block.</li>
                    </ul>
                </div>
            </div>
        </Modal>
    );
}

export default ImportGiftModal;
