import { useState, useEffect } from 'react';
import { Modal } from 'antd';
import { Save, AlignLeft, FileText, Loader2, Plus, Trash2 } from 'lucide-react';

export interface SlotQuestionContentData {
    id?: string;
    content: string;
    description?: string;
    displayOrder?: number;
}

interface SlotQuestionContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** In create mode: called with array of items. In edit mode: called with single-item array. */
    onSave: (data: SlotQuestionContentData[]) => void;
    editData?: SlotQuestionContentData | null;
    slotTitle?: string;
    isSaving?: boolean;
}

const EMPTY_ROW = (): { content: string; description: string } => ({ content: '', description: '' });
const DEFAULT_ROWS = 3;

export default function SlotQuestionContentModal({
    isOpen,
    onClose,
    onSave,
    editData,
    slotTitle,
    isSaving = false
}: SlotQuestionContentModalProps) {
    const isEditMode = !!editData;

    // Single-question state (edit mode)
    const [editContent, setEditContent] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Multi-question state (create mode)
    const [rows, setRows] = useState<{ content: string; description: string }[]>(
        Array.from({ length: DEFAULT_ROWS }, EMPTY_ROW)
    );

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setEditContent(editData.content || '');
                setEditDescription(editData.description || '');
            } else {
                setRows(Array.from({ length: DEFAULT_ROWS }, EMPTY_ROW));
            }
        } else {
            setEditContent('');
            setEditDescription('');
            setRows(Array.from({ length: DEFAULT_ROWS }, EMPTY_ROW));
        }
    }, [isOpen, editData]);

    const updateRow = (index: number, field: 'content' | 'description', value: string) => {
        setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
    };

    const addRow = () => setRows(prev => [...prev, EMPTY_ROW()]);

    const removeRow = (index: number) => {
        if (rows.length <= 1) return;
        setRows(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (isEditMode) {
            if (!editContent.trim()) return;
            onSave([{
                id: editData?.id,
                content: editContent.trim(),
                description: editDescription.trim() || undefined,
                displayOrder: editData?.displayOrder
            }]);
        } else {
            const validRows = rows.filter(r => r.content.trim());
            if (validRows.length === 0) return;
            onSave(validRows.map((r, i) => ({
                content: r.content.trim(),
                description: r.description.trim() || undefined,
                displayOrder: i + 1,
            })));
        }
    };

    const canSubmit = isEditMode
        ? editContent.trim().length > 0
        : rows.some(r => r.content.trim().length > 0);

    return (
        <Modal
            title={
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-[#F37022]" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#0A1B3C]">
                            {isEditMode ? 'Edit Question' : 'Create Questions'}
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
            width={700}
            centered
            destroyOnClose
            closeIcon={!isSaving}
            className="custom-modal"
        >
            <div className="mt-6 border-t border-gray-100 pt-5">
                <form onSubmit={handleSubmit}>
                    {isEditMode ? (
                        /* ─── Edit Mode: single form ─── */
                        <div className="space-y-5">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <AlignLeft className="w-4 h-4 text-gray-400" />
                                    Question Content <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={editContent}
                                    onChange={e => setEditContent(e.target.value)}
                                    placeholder="Enter your question here..."
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-[#F37022]/20 focus:border-[#F37022] transition-colors"
                                    required
                                    disabled={isSaving}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    Description / Notes <span className="text-gray-400 font-normal">(Optional)</span>
                                </label>
                                <textarea
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    placeholder="Additional details, context, or instructions for this question"
                                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#F37022]/20 focus:border-[#F37022] transition-colors"
                                    disabled={isSaving}
                                />
                            </div>
                        </div>
                    ) : (
                        /* ─── Create Mode: multi-row ─── */
                        <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                            {rows.map((row, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 border border-gray-200 rounded-xl bg-gray-50/60 relative group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                            Question {idx + 1}
                                        </span>
                                        {rows.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeRow(idx)}
                                                disabled={isSaving}
                                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Remove this question"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        value={row.content}
                                        onChange={e => updateRow(idx, 'content', e.target.value)}
                                        placeholder={`Question ${idx + 1} content...`}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-[#F37022]/20 focus:border-[#F37022] transition-colors"
                                        disabled={isSaving}
                                    />
                                    <textarea
                                        value={row.description}
                                        onChange={e => updateRow(idx, 'description', e.target.value)}
                                        placeholder="Description / Notes (optional)"
                                        className="w-full mt-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs min-h-[50px] resize-y focus:outline-none focus:ring-2 focus:ring-[#F37022]/20 focus:border-[#F37022] transition-colors text-gray-500"
                                        disabled={isSaving}
                                    />
                                </div>
                            ))}

                            {/* Add more button */}
                            <button
                                type="button"
                                onClick={addRow}
                                disabled={isSaving}
                                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-[#F37022] hover:text-[#F37022] hover:bg-orange-50/50 transition-all flex items-center justify-center gap-2 font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add another question
                            </button>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-5">
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
                            disabled={!canSubmit || isSaving}
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
                                    {isEditMode ? 'Update Question' : 'Save Questions'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
