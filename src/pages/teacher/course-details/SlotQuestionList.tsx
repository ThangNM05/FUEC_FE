import { useState } from 'react';
import { FileText, Loader2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Modal } from 'antd';
import { 
    useGetSlotQuestionContentsBySlotIdQuery, 
    useCreateSlotQuestionContentMutation,
    useUpdateSlotQuestionContentMutation,
    useDeleteSlotQuestionContentMutation
} from '@/api/slotQuestionContentsApi';
import SlotQuestionContentModal from '@/components/modals/SlotQuestionContentModal';
import type { SlotQuestionContentData } from '@/components/modals/SlotQuestionContentModal';

export default function SlotQuestionList({ 
    slotId, 
    slotTitle, 
    onLoad 
}: { 
    slotId: string, 
    slotTitle: string,
    onLoad?: (hasQuestions: boolean) => void 
}) {
    const { data: questions, isLoading } = useGetSlotQuestionContentsBySlotIdQuery(slotId);
    const [createQuestion, { isLoading: isCreating }] = useCreateSlotQuestionContentMutation();
    const [updateQuestion, { isLoading: isUpdating }] = useUpdateSlotQuestionContentMutation();
    const [deleteQuestion] = useDeleteSlotQuestionContentMutation();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<SlotQuestionContentData | null>(null);

    // Expose open modal function to parent via an event or just keep it simple with a button here?
    // Based on the UI, the "Create Question" button is in the parent dropdown. 
    // We will listen to a custom event from window or just let parent render the modal.
    // Actually, it's better to export the raw questions and let parent map it, but hooks break if called in a loop.
    // So this component ONLY renders the QUESTIONS list.

    const handleDelete = (id: string, content: string) => {
        Modal.confirm({
            title: 'Delete Question',
            content: `Are you sure you want to delete this question?`,
            okText: 'Delete',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk: async () => {
                try {
                    await deleteQuestion(id).unwrap();
                    toast.success('Question deleted successfully');
                } catch (error) {
                    toast.error('Failed to delete question');
                }
            },
        });
    };

    if (isLoading) {
        return (
            <div className="py-2 flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading questions...</span>
            </div>
        );
    }

    if (!questions || questions.length === 0) {
        if (onLoad) onLoad(false);
        return null;
    }

    if (onLoad) onLoad(true);

    return (
        <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 pb-2 border-b border-gray-100">
                QUESTIONS
            </h4>
            <div className="space-y-1">
                {questions.map(question => (
                    <div key={question.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 text-orange-500">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex flex-col">
                                <span className="text-sm font-medium text-gray-800 line-clamp-2">
                                    {question.content}
                                </span>
                                {question.description && (
                                    <span className="text-xs text-gray-500 truncate">{question.description}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => {
                                        setEditingQuestion(question);
                                        setIsModalOpen(true);
                                    }}
                                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit Question"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(question.id, question.content)}
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete Question"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <SlotQuestionContentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingQuestion(null);
                }}
                isSaving={isUpdating}
                slotTitle={slotTitle}
                editData={editingQuestion}
                onSave={async (data) => {
                    if (data.id) {
                        try {
                            await updateQuestion({
                                id: data.id,
                                body: { content: data.content, description: data.description }
                            }).unwrap();
                            toast.success('Question updated successfully');
                            setIsModalOpen(false);
                            setEditingQuestion(null);
                        } catch {
                            toast.error('Failed to update question');
                        }
                    }
                }}
            />
        </div>
    );
}
