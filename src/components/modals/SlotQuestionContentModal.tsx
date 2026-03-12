import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Save, AlignLeft, FileText, Loader2 } from 'lucide-react';

export interface SlotQuestionContentData {
    id?: string;
    content: string;
    description?: string;
    displayOrder?: number;
}

interface SlotQuestionContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: SlotQuestionContentData) => void;
    editData?: SlotQuestionContentData | null;
    slotTitle?: string;
    isSaving?: boolean;
}

export default function SlotQuestionContentModal({
    isOpen,
    onClose,
    onSave,
    editData,
    slotTitle,
    isSaving = false
}: SlotQuestionContentModalProps) {
    const [content, setContent] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setContent(editData.content || '');
                setDescription(editData.description || '');
            } else {
                setContent('');
                setDescription('');
            }
        } else {
            setContent('');
            setDescription('');
        }
    }, [isOpen, editData]);

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!content.trim()) return;

        onSave({
            id: editData?.id,
            content: content.trim(),
            description: description.trim() || undefined,
            displayOrder: editData?.displayOrder
        });
    };

    const isEditMode = !!editData;

    return (
        <Modal
            title={
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#F37022]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#0A1B3C]">
                            {isEditMode ? 'Edit Question' : 'Create Question'}
                        </h2>
                        <p className="text-sm text-gray-500 font-normal mt-0.5">
                            {slotTitle ? `For ${slotTitle}` : 'Create custom question content for this slot'}
                        </p>
                    </div>
                </div>
            }
            open={isOpen}
            onCancel={!isSaving ? onClose : undefined}
            footer={null}
            width={650}
            centered
            destroyOnClose
            closeIcon={!isSaving}
            className="custom-modal"
        >
            <div className="mt-6 border-t border-gray-100 pt-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Content */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <AlignLeft className="w-4 h-4 text-gray-400" />
                            Question Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            placeholder="Enter your question here..."
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm min-h-[140px] resize-y focus:outline-none focus:ring-2 focus:ring-[#F37022]/20 focus:border-[#F37022] transition-colors"
                            required
                            disabled={isSaving}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            Description / Notes <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Additional details, context, or instructions for this question"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-[#F37022]/20 focus:border-[#F37022] transition-colors"
                            disabled={isSaving}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 bg-white border border-gray-300 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!content.trim() || isSaving}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#F37022] text-white text-sm font-semibold rounded-xl hover:bg-[#d95f19] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {isEditMode ? 'Update Question' : 'Save Question'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
