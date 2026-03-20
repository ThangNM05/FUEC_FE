import { useState, useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { Upload, X, FileText, ClipboardList, AlertCircle, CheckCircle, Loader2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useUploadFileMutation } from '@/api/filesApi';
import { useUpdateAssignmentMutation } from '@/api/assignmentsApi';
import type { Assignment } from '@/types/assignment.types';

interface EditAssignmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: Assignment | null;
}

export default function EditAssignmentModal({ isOpen, onClose, assignment }: EditAssignmentModalProps) {
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadFile, { isLoading: isUploading }] = useUploadFileMutation();
    const [updateAssignment, { isLoading: isUpdating }] = useUpdateAssignmentMutation();

    const isSubmitting = isUploading || isUpdating;

    useEffect(() => {
        if (assignment && isOpen) {
            setDescription(assignment.description || '');
            setSelectedFile(null);
            setUploadProgress('idle');
        }
    }, [assignment, isOpen]);

    const handleClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        setUploadProgress('idle');
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => setIsDragging(false);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleSubmit = async () => {
        if (!assignment) return;
        if (!description.trim()) {
            toast.error('Please enter a description.');
            return;
        }

        try {
            let attachedFileId: string | undefined;

            if (selectedFile) {
                setUploadProgress('uploading');
                const fileResult = await uploadFile({ file: selectedFile, folder: 'assignments' }).unwrap();
                setUploadProgress('done');
                attachedFileId = fileResult.id;
            }

            await updateAssignment({
                id: assignment.id,
                description: description.trim(),
                ...(attachedFileId && { attachedFileId }),
            }).unwrap();

            toast.success(`${assignment.displayName || `ASM${assignment.instanceNumber}`} updated successfully!`);
            onClose();
        } catch (error: any) {
            setUploadProgress('error');
            const message = error?.data?.message || error?.message || 'Failed to update assignment.';
            toast.error(message);
        }
    };

    const getUploadIcon = () => {
        switch (uploadProgress) {
            case 'uploading':
                return <Loader2 className="w-5 h-5 text-[#F37022] animate-spin" />;
            case 'done':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <FileText className="w-5 h-5 text-gray-400" />;
        }
    };

    if (!assignment) return null;

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <Pencil className="w-5 h-5 text-[#F37022]" />
                    <span className="font-bold text-[#0A1B3C]">
                        Edit {assignment.displayName || `ASM${assignment.instanceNumber}`}
                    </span>
                </div>
            }
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            width={600}
            centered
            closable={!isSubmitting}
            maskClosable={!isSubmitting}
        >
            <div className="py-4 space-y-5">
                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-[#0A1B3C] mb-1.5">
                        Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what students need to do for this assignment..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-[#F37022] focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/4000</p>
                </div>

                {/* File Attachment (replace existing) */}
                <div>
                    <label className="block text-sm font-semibold text-[#0A1B3C] mb-1.5">
                        Replace Attachment <span className="text-gray-400 font-normal">(optional)</span>
                    </label>

                    {assignment.fileName && !selectedFile && (
                        <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg mb-3">
                            <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">{assignment.fileName}</span>
                            <span className="text-xs text-gray-400 ml-auto">Current file</span>
                        </div>
                    )}

                    {selectedFile ? (
                        <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="w-10 h-10 bg-white rounded-lg border border-orange-200 flex items-center justify-center flex-shrink-0">
                                {getUploadIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#0A1B3C] truncate">{selectedFile.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                {uploadProgress === 'uploading' && (
                                    <p className="text-xs text-[#F37022] mt-0.5">Uploading...</p>
                                )}
                                {uploadProgress === 'done' && (
                                    <p className="text-xs text-green-600 mt-0.5">Upload complete</p>
                                )}
                                {uploadProgress === 'error' && (
                                    <p className="text-xs text-red-600 mt-0.5">Upload failed. Please try again.</p>
                                )}
                            </div>
                            {!isSubmitting && (
                                <button
                                    onClick={() => {
                                        setSelectedFile(null);
                                        setUploadProgress('idle');
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                                >
                                    <X className="w-4 h-4 text-red-500" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragging
                                    ? 'border-[#F37022] bg-orange-50'
                                    : 'border-gray-300 hover:border-[#F37022] hover:bg-gray-50'
                                }`}
                        >
                            <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-[#F37022]' : 'text-gray-400'}`} />
                            <p className="text-sm font-medium text-gray-700">
                                {isDragging ? 'Drop file here' : 'Click to browse or drag & drop'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">Upload a new file to replace the current one</p>
                        </div>
                    )}

                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.zip,.rar,.txt,.pptx,.xlsx,.xls"
                        onChange={handleFileInputChange}
                        disabled={isSubmitting}
                    />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !description.trim()}
                        className="flex items-center gap-2 px-5 py-2 bg-[#F37022] text-white rounded-lg text-sm font-semibold hover:bg-[#D96419] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isUploading ? 'Uploading...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <ClipboardList className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
