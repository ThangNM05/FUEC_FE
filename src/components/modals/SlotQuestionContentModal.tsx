import { useState, useEffect } from 'react';
import { Modal, Tooltip } from 'antd';
import { FileText, Plus, Trash2, Loader2, AlertCircle, HelpCircle, Sparkles } from 'lucide-react';
import { useGenerateAISlotQuestionsMutation } from '@/api/slotQuestionContentsApi';
import { toast } from 'sonner';

export interface SlotQuestionContentData {
    id?: string;
    content: string;
    description?: string;
}

interface SlotQuestionContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dataList: SlotQuestionContentData[]) => Promise<void>;
    isSaving: boolean;
    slotTitle?: string;
    editData?: SlotQuestionContentData | null;
    topics?: string[];
}

export default function SlotQuestionContentModal({
    isOpen,
    onClose,
    onSave,
    isSaving,
    slotTitle,
    editData,
    topics = []
}: SlotQuestionContentModalProps) {
    const [generateAI, { isLoading: isGenerating }] = useGenerateAISlotQuestionsMutation();
    const [rows, setRows] = useState<SlotQuestionContentData[]>([
        { content: '', description: '' },
        { content: '', description: '' },
        { content: '', description: '' }
    ]);

    const isEditMode = !!editData;

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                setRows([{ ...editData }]);
            } else {
                setRows([
                    { content: '', description: '' },
                    { content: '', description: '' },
                    { content: '', description: '' }
                ]);
            }
        }
    }, [isOpen, editData]);

    const handleChange = (idx: number, field: keyof SlotQuestionContentData, value: string) => {
        const newRows = [...rows];
        newRows[idx] = { ...newRows[idx], [field]: value };
        setRows(newRows);
    };

    const addRow = () => {
        setRows([...rows, { content: '', description: '' }]);
    };

    const removeRow = (idx: number) => {
        if (rows.length > 1) {
            setRows(rows.filter((_, i) => i !== idx));
        }
    };

    const handleGenerateAI = async () => {
        if (topics.length === 0) {
            toast.error('No topics available for AI generation');
            return;
        }

        try {
            const result = await generateAI({
                topics: topics.join(', '),
                count: 3
            }).unwrap();

            if (result && result.length > 0) {
                // Filter out empty rows and add AI rows
                const existingContent = rows.filter(r => r.content.trim() !== '');
                const aiRows = result.map(q => ({
                    content: q.content,
                    description: q.description
                }));

                setRows([...existingContent, ...aiRows]);
                toast.success(`Generated ${result.length} questions successfully`);
            }
        } catch (error) {
            toast.error('Failed to generate questions with AI');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: at least one row must have content
        const validRows = rows.filter(r => r.content.trim());
        if (validRows.length === 0) {
            return; // Or show error
        }

        await onSave(validRows);
    };

    const handleClose = () => {
        if (!isSaving) {
            onClose();
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-[#0A1B3C]">
                        {isEditMode ? 'Edit Question' : 'Create Questions'}
                        {slotTitle ? ` — ${slotTitle}` : ''}
                    </span>
                </div>
            }
            open={isOpen}
            onCancel={handleClose}
            footer={null}
            width={700}
            centered
            maskClosable={!isSaving}
            closable={!isSaving}
            destroyOnClose
        >
            <form onSubmit={handleSubmit} className="py-2">
                <div className={`space-y-6 ${!isEditMode ? 'max-h-[60vh] overflow-y-auto pr-3 custom-scrollbar' : ''} mb-6`}>
                    {!isEditMode && (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-blue-800 font-medium">You can create multiple questions at once. Only rows with content will be saved.</span>
                            </div>
                            <Tooltip title={topics.length === 0 ? "No topics available in this slot" : "Generate 3 questions based on slot topics"}>
                                <button
                                    type="button"
                                    onClick={handleGenerateAI}
                                    disabled={isGenerating || topics.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md shadow-purple-100 disabled:opacity-50 shrink-0"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            AI Suggest
                                        </>
                                    )}
                                </button>
                            </Tooltip>
                        </div>
                    )}

                    {rows.map((row, idx) => (
                        <div key={idx} className="relative bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-200 transition-colors shadow-sm group">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Question {idx + 1}
                                </span>
                                {!isEditMode && rows.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeRow(idx)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove question"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                                        Content <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={row.content || ''}
                                        onChange={(e) => handleChange(idx, 'content', e.target.value)}
                                        placeholder="Enter question content..."
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none transition-all resize-none font-medium text-gray-800"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 ml-1">
                                        Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={row.description || ''}
                                        onChange={(e) => handleChange(idx, 'description', e.target.value)}
                                        placeholder="Add more details or hints..."
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-50 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {!isEditMode && (
                    <button
                        type="button"
                        onClick={addRow}
                        className="w-full py-3 mb-6 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-500 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50/50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add another question row
                    </button>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSaving}
                        className="px-6 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || rows.filter(r => r.content.trim()).length === 0}
                        className="flex items-center gap-2 px-8 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold shadow-md shadow-orange-100 transition-all disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                {isEditMode ? 'Save Changes' : `Save ${rows.filter(r => r.content.trim()).length || ''} Question(s)`}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
