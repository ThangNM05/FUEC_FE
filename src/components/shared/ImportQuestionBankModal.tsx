import { useState, useRef } from 'react';
import type { DragEvent } from 'react';
import { Upload, FileSpreadsheet, FileCode2, X } from 'lucide-react';
import { Modal, Button, InputNumber } from 'antd';
import toast from '@/lib/toast';

interface ImportQuestionBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (file: File, defaultChapter?: number) => void;
    subjectCode?: string;
    isPreviewing?: boolean;
}

type FileFormat = 'excel' | 'gift' | null;

function detectFormat(file: File): FileFormat {
    const name = file.name.toLowerCase();
    if (name.endsWith('.xlsx') || name.endsWith('.xls')) return 'excel';
    if (name.endsWith('.gift') || name.endsWith('.txt')) return 'gift';
    return null;
}

function ImportQuestionBankModal({
    isOpen,
    onClose,
    onConfirm,
    subjectCode,
    isPreviewing = false,
}: ImportQuestionBankModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [detectedFormat, setDetectedFormat] = useState<FileFormat>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [defaultChapter, setDefaultChapter] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileAccept = (file: File) => {
        const fmt = detectFormat(file);
        if (!fmt) {
            toast.error('Unsupported file. Please upload .xlsx, .xls, .gift, or .txt');
            return;
        }
        setSelectedFile(file);
        setDetectedFormat(fmt);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileAccept(file);
        e.target.value = '';
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileAccept(file);
    };

    const handleConfirm = () => {
        if (!selectedFile) {
            toast.warning('Please select a file to upload');
            return;
        }
        onConfirm(selectedFile, detectedFormat === 'gift' ? (defaultChapter ?? undefined) : undefined);
    };

    const handleClose = () => {
        setSelectedFile(null);
        setDetectedFormat(null);
        setDefaultChapter(null);
        onClose();
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setDetectedFormat(null);
    };

    const FormatBadge = () => {
        if (!detectedFormat) return null;
        if (detectedFormat === 'excel') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                    <FileSpreadsheet className="w-3 h-3" />
                    Excel
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                <FileCode2 className="w-3 h-3" />
                GIFT
            </span>
        );
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#F37022]" />
                    <span>Import Question Bank{subjectCode ? ` — ${subjectCode}` : ''}</span>
                </div>
            }
            open={isOpen}
            onCancel={handleClose}
            width={620}
            footer={[
                <div key="footer" className="flex items-center justify-end gap-2 w-full">
                    <Button onClick={handleClose} disabled={isPreviewing}>
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={handleConfirm}
                        loading={isPreviewing}
                        disabled={!selectedFile || isPreviewing}
                        className="bg-[#F37022] hover:bg-[#D96419] border-none"
                    >
                        {isPreviewing ? 'Parsing...' : 'Preview Import'}
                    </Button>
                </div>,
            ]}
        >
            <div className="py-4 space-y-5">
                {/* Supported formats info */}
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>Supported formats:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
                        <FileSpreadsheet className="w-3 h-3" /> Excel (.xlsx, .xls)
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                        <FileCode2 className="w-3 h-3" /> GIFT (.gift, .txt)
                    </span>
                </div>

                {/* Drop zone */}
                <div
                    className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                        isDragging
                            ? 'border-[#F37022] bg-orange-50 scale-[1.01]'
                            : selectedFile
                            ? detectedFormat === 'gift'
                                ? 'border-purple-400 bg-purple-50'
                                : 'border-green-400 bg-green-50'
                            : 'border-gray-200 hover:border-[#F37022] hover:bg-gray-50'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                >
                    <div className="flex justify-center mb-4">
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                                selectedFile
                                    ? detectedFormat === 'gift'
                                        ? 'bg-purple-500'
                                        : 'bg-green-500'
                                    : 'bg-[#F37022]'
                            }`}
                        >
                            {selectedFile ? (
                                detectedFormat === 'gift' ? (
                                    <FileCode2 className="w-8 h-8 text-white" />
                                ) : (
                                    <FileSpreadsheet className="w-8 h-8 text-white" />
                                )
                            ) : (
                                <Upload className="w-8 h-8 text-white" />
                            )}
                        </div>
                    </div>

                    {selectedFile ? (
                        <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2">
                                <p className={`text-base font-bold ${detectedFormat === 'gift' ? 'text-purple-700' : 'text-green-700'}`}>
                                    {selectedFile.name}
                                </p>
                                <button
                                    onClick={removeFile}
                                    className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
                                    title="Remove file"
                                >
                                    <X className={`w-4 h-4 ${detectedFormat === 'gift' ? 'text-purple-500' : 'text-green-500'}`} />
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <FormatBadge />
                                <span className={`text-sm ${detectedFormat === 'gift' ? 'text-purple-500' : 'text-green-500'}`}>
                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-base font-bold text-[#0A1B3C]">
                                Drag & drop or click to upload
                            </p>
                            <p className="text-sm text-gray-400">
                                .xlsx / .xls for Excel &nbsp;·&nbsp; .gift / .txt for GIFT format
                            </p>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.gift,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                </div>

                {/* GIFT-only: default chapter */}
                {detectedFormat === 'gift' && (
                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-lg">
                        <FileCode2 className="w-4 h-4 text-purple-500 shrink-0" />
                        <label className="text-sm font-medium text-purple-800 whitespace-nowrap">
                            Default Chapter
                            <span className="ml-1 text-purple-400 font-normal">(optional)</span>
                        </label>
                        <InputNumber
                            min={1}
                            max={999}
                            value={defaultChapter}
                            onChange={(val) => setDefaultChapter(val)}
                            placeholder="e.g. 1"
                            className="w-28"
                            size="small"
                        />
                        <span className="text-xs text-purple-500">
                            Applied to questions without an explicit chapter.
                        </span>
                    </div>
                )}

                {/* Format hints */}
                {detectedFormat === 'excel' && (
                    <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-xs text-green-700 space-y-1">
                        <p className="font-semibold">Excel Format Tips</p>
                        <p className="text-green-600">
                            Use the standard template with columns: <span className="font-mono bg-green-100 px-1 rounded">QuestionContent</span>, <span className="font-mono bg-green-100 px-1 rounded">Options</span>, <span className="font-mono bg-green-100 px-1 rounded">CorrectAnswer</span>, <span className="font-mono bg-green-100 px-1 rounded">Tag</span>, <span className="font-mono bg-green-100 px-1 rounded">Chapter</span>.
                        </p>
                    </div>
                )}

                {detectedFormat === 'gift' && (
                    <div className="rounded-lg bg-purple-50 border border-purple-100 p-3 text-xs text-purple-700 space-y-1">
                        <p className="font-semibold">GIFT Format Tips</p>
                        <ul className="list-disc list-inside space-y-0.5 text-purple-600">
                            <li>Each question block is separated by a blank line.</li>
                            <li>Correct answers are prefixed with <code className="bg-purple-100 px-1 rounded">=</code>, wrong with <code className="bg-purple-100 px-1 rounded">~</code>.</li>
                            <li>Optional tag: <code className="bg-purple-100 px-1 rounded">::tag::</code> before the question stem.</li>
                            <li>Optional chapter: <code className="bg-purple-100 px-1 rounded">// Chapter: N</code> line above a block.</li>
                        </ul>
                    </div>
                )}

                {!detectedFormat && (
                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-xs text-gray-500">
                        Select a file above to see format-specific guidance.
                    </div>
                )}
            </div>
        </Modal>
    );
}

export default ImportQuestionBankModal;
