import { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router';
import {
    ChevronRight, Search, Plus, Upload, Filter, Download,
    FileQuestion, Edit2, Trash2, ClipboardList
} from 'lucide-react';
import QuestionModal, { type QuestionData } from '../../../components/modals/QuestionModal';
import ImportPreviewModal from '../../../components/modals/ImportPreviewModal';
import {
    useGetQuestionsQuery,
    useCreateQuestionMutation,
    useUpdateQuestionMutation,
    useDeleteQuestionMutation,
    useDeleteQuestionsMutation,
    usePreviewImportQuestionsMutation,
    useImportQuestionsMutation,
    type ImportPreviewResult,
    type ImportPreviewQuestion
} from '../../../api/questionsApi';
import { toast } from 'sonner';
import { useGetSubjectByCodeQuery } from '../../../api/subjectsApi';

interface Question {
    id: string;
    content: string;
    type: 'multiple_choice' | 'true_false' | 'essay';
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    options?: string[];
    correctAnswer?: number;
    createdAt: string;
}

const subjectNames: Record<string, string> = {
    SE101: 'Software Engineering Foundation',
    CS201: 'Data Structures and Algorithms',
    DB301: 'Database Systems',
    AI101: 'Introduction to AI',
    MKT101: 'Marketing Principles'
};

const initialQuestions: Question[] = [
    {
        id: 'q1',
        content: 'Which of the following describes the waterfall model?',
        type: 'multiple_choice',
        difficulty: 'easy',
        tags: ['PT1', 'SDLC'],
        options: ['A linear sequential approach', 'An iterative approach', 'A prototype-based approach', 'A random approach'],
        correctAnswer: 0,
        createdAt: '2025-02-15',
    },
    {
        id: 'q2',
        content: 'Agile manifesto prioritizes comprehensive documentation over working software.',
        type: 'true_false',
        difficulty: 'easy',
        tags: ['PT1', 'Agile'],
        options: ['True', 'False'],
        correctAnswer: 1,
        createdAt: '2025-02-16',
    },
    {
        id: 'q3',
        content: 'Explain the difference between functional and non-functional requirements with examples.',
        type: 'essay',
        difficulty: 'medium',
        tags: ['PT2', 'Requirements'],
        createdAt: '2025-02-20',
    },
    {
        id: 'q4',
        content: 'What design pattern should be used when you want a single instance of a class?',
        type: 'multiple_choice',
        difficulty: 'medium',
        tags: ['PT2', 'Design Patterns'],
        options: ['Singleton', 'Factory', 'Observer', 'Strategy'],
        correctAnswer: 0,
        createdAt: '2025-02-22',
    },
    {
        id: 'q5',
        content: 'The Open/Closed Principle states that software entities should be open for modification.',
        type: 'true_false',
        difficulty: 'hard',
        tags: ['PT3', 'SOLID'],
        options: ['True', 'False'],
        correctAnswer: 1,
        createdAt: '2025-02-24',
    },
];

function AdminQuestionBankDetail() {
    const navigate = useNavigate();
    const { subjectId } = useParams();
    const subjectName = subjectNames[subjectId || ''] || 'Subject Details';

    // RTK Query Hooks – exact code lookup so we always get the right subject GUID
    const { data: subjectData } = useGetSubjectByCodeQuery(subjectId || '', { skip: !subjectId });
    const actualSubjectId = subjectData?.id || '';

    // Import Excel – 2-step: preview then confirm
    const [previewImport, { isLoading: isPreviewing }] = usePreviewImportQuestionsMutation();
    const [importQuestions, { isLoading: isImporting }] = useImportQuestionsMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importPreviewData, setImportPreviewData] = useState<ImportPreviewResult | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = '';
        const formData = new FormData();
        formData.append('file', file);
        if (subjectId) {
            formData.append('expectedSubjectCode', subjectId);
        }
        try {
            const result = await previewImport(formData).unwrap();
            if (result.errors && result.errors.length > 0 && result.questions.length === 0) {
                toast.error(result.errors[0]);
                return;
            }
            setImportPreviewData(result);
            setIsPreviewModalOpen(true);
        } catch {
            toast.error('Failed to parse file. Please check the format.');
        }
    };

    const handleConfirmImport = async (selectedQuestions: ImportPreviewQuestion[]) => {
        if (!importPreviewData) return;
        try {
            const result = await importQuestions({
                subjectCode: importPreviewData.subjectCode,
                selectedQuestions
            }).unwrap();
            toast.success(`Imported ${result.questionsCreated} question${result.questionsCreated !== 1 ? 's' : ''} successfully!`);
            setIsPreviewModalOpen(false);
            setImportPreviewData(null);
            refetch();
        } catch {
            toast.error('Failed to import questions.');
        }
    };

    const { data: questionsData, isLoading, refetch } = useGetQuestionsQuery({
        subjectCode: subjectId,
        pageSize: 1000 // Get all for now, since we filter locally in the UI
    });
    const [createQuestion] = useCreateQuestionMutation();
    const [updateQuestion] = useUpdateQuestionMutation();
    const [deleteQuestion] = useDeleteQuestionMutation();
    const [deleteQuestions] = useDeleteQuestionsMutation();

    const questions: Question[] = (questionsData?.items || []).map(q => {
        // Map backend Dto to frontend Question shape
        const options = q.options || [];

        // Map Tags from single comma-separated string if needed, or assume it's one tag. 
        // The UI handles an array of tags, so we split by comma just in case.
        const tags = q.tag ? q.tag.split(',').map((t: string) => t.trim()) : [];

        // Find index of first correct answer
        const correctIndex = options.findIndex((o: any) => o.isCorrect);

        return {
            id: q.id,
            content: q.questionContent,
            tags,
            options: options.map((o: any) => o.choiceContent || ''),
            correctAnswer: correctIndex >= 0 ? correctIndex : undefined,
            createdAt: q.createdAt,
            rawOptions: options // Keep track of ids for updating
        } as any;
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPT, setSelectedPT] = useState('All');

    // Selection State
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Extract all unique PT tags from all questions
    const allPTs = Array.from(
        new Set(
            questions.flatMap((q: any) => q.tags.filter((t: string) => t.toUpperCase().startsWith('PT')))
        )
    ).sort();

    const ptTabs = ['All', ...allPTs];

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

    // ─── CRUD Operations ───
    const handleAddQuestion = () => {
        setEditingQuestion(null);
        console.log("Add Question clicked"); setModalOpen(true);
    };

    const handleEditQuestion = (q: any) => {
        setEditingQuestion({
            id: q.id,
            content: q.content,
            tags: q.tags,
            options: q.options,
            correctAnswer: q.correctAnswer,
            rawOptions: q.rawOptions // Pass raw options to keep their IDs
        } as any);
        console.log("Add Question clicked"); setModalOpen(true);
    };

    const handleSaveQuestion = async (data: any) => {
        try {
            const mappedOptions = data.options?.map((optContent: string, index: number) => {
                const isCorrect = data.correctAnswer === index;
                const existingOpt = data.rawOptions?.[index];
                if (existingOpt) {
                    return { id: existingOpt.id, choiceContent: optContent, isCorrect }; // Update
                }
                return { choiceContent: optContent, isCorrect }; // Create
            }) || [];

            if (data.id) {
                // Update
                await updateQuestion({
                    id: data.id,
                    body: {
                        questionContent: data.content,
                        questionType: 0, // Single
                        tag: data.tags.join(','),
                        points: 1.0,
                        options: mappedOptions
                    }
                }).unwrap();
            } else {
                if (!actualSubjectId) return; // Cant create without subject guid
                await createQuestion({
                    questionContent: data.content,
                    questionType: 0,
                    subjectId: actualSubjectId,
                    tag: data.tags.join(','),
                    points: 1.0,
                    options: mappedOptions
                }).unwrap();
            }
            setModalOpen(false);
            setEditingQuestion(null);
            refetch(); // Ensure latest data
        } catch (error) {
            console.error("Failed to save question:", error);
            // Optionally show error toast
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        try {
            await deleteQuestion(id).unwrap();
            setDeleteId(null);
            refetch(); // Ensure latest data
            if (selectedIds.has(id)) {
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        } catch (error) {
            console.error("Failed to delete question", error);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await deleteQuestions(Array.from(selectedIds)).unwrap();
            toast.success(`${selectedIds.size} question${selectedIds.size !== 1 ? 's' : ''} deleted successfully!`);
            setSelectedIds(new Set());
            setBulkDeleteConfirmOpen(false);
            refetch();
        } catch {
            toast.error('Failed to delete selected questions.');
        }
    };

    // ─── Filtering ───
    const filteredQuestions = questions.filter((q: any) => {
        const matchesSearch = !searchQuery ||
            q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesPT = selectedPT === 'All' || q.tags.includes(selectedPT);

        return matchesSearch && matchesPT;
    });

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredQuestions.map((q: any) => q.id)));
        }
    };

    const isAllSelected = filteredQuestions.length > 0 && selectedIds.size === filteredQuestions.length;

    // ─── Helpers ───
    const getDifficultyColor = (d: string) => {
        if (d === 'easy') return 'bg-green-100 text-green-700';
        if (d === 'medium') return 'bg-yellow-100 text-yellow-700';
        if (d === 'hard') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    const getTypeDisplay = (t: string) => {
        if (t === 'multiple_choice') return 'Multiple Choice';
        if (t === 'true_false') return 'True/False';
        return 'Essay';
    };

    const getTypeColor = (t: string) => {
        if (t === 'multiple_choice') return 'bg-blue-50 text-blue-700';
        if (t === 'true_false') return 'bg-purple-50 text-purple-700';
        return 'bg-orange-50 text-orange-700';
    };

    if (isLoading) {
        return (
            <div className="p-4 md:p-6 flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-12 h-12 border-4 border-[#F37022] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <button onClick={() => navigate('/admin')} className="hover:text-[#F37022] transition-colors">
                    Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => navigate('/admin/question-banks')} className="hover:text-[#F37022] transition-colors">
                    Question Banks
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">{subjectId}</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#0A1B3C] flex items-center gap-3">
                        {subjectId} - {subjectName}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">{questions.length} total questions in bank</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    {/* Hidden file input for import */}
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                    />
                    {/* Download Template */}
                    <a
                        href="/templates/question_bank_template.xlsx"
                        download
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors bg-white"
                    >
                        <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Download Template</span>
                    </a>
                    {/* Import Excel */}
                    <button
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-2 border-[#F37022] text-[#F37022] rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-50 transition-colors bg-white disabled:opacity-60"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPreviewing || isImporting}
                    >
                        {(isPreviewing || isImporting)
                            ? <div className="w-3.5 h-3.5 border-2 border-[#F37022] border-t-transparent rounded-full animate-spin" />
                            : <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                        <span className="hidden sm:inline">{isPreviewing ? 'Parsing...' : isImporting ? 'Importing...' : 'Import Excel'}</span>
                    </button>
                    <button
                        onClick={handleAddQuestion}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-[#F37022] text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-[#d95f19] transition-all active:scale-95 shadow-md shadow-orange-200"
                    >
                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>Add Question</span>
                    </button>
                </div>
            </div>

            {/* PT Tabs */}
            <div className="flex overflow-x-auto pb-2 mb-6 gap-2 hide-scrollbar">
                {ptTabs.map(pt => {
                    const count = pt === 'All'
                        ? questions.length
                        : questions.filter(q => q.tags.includes(pt)).length;

                    return (
                        <button
                            key={pt}
                            onClick={() => setSelectedPT(pt)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${selectedPT === pt
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {pt}
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${selectedPT === pt ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
                                }`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search questions or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                </div>
            </div>

            {/* Questions List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {selectedIds.size > 0 && (
                    <div className="bg-orange-50 px-6 py-3 border-b border-orange-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-orange-800">
                            {selectedIds.size} question{selectedIds.size !== 1 ? 's' : ''} selected
                        </span>
                        <button
                            onClick={() => setBulkDeleteConfirmOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors shadow-sm"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Selected
                        </button>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                                <th className="px-6 py-4 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-4">Question Content</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Tags</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredQuestions.map((q) => (
                                <tr key={q.id} className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.has(q.id) ? 'bg-orange-50/30' : ''}`}>
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(q.id)}
                                            onChange={() => toggleSelect(q.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4" onClick={(e) => {
                                        // Make clicking the cell toggle selection as well, but ignore if clicking inside file icon (minor UX tweak)
                                        if ((e.target as HTMLElement).closest('.action-btn')) return;
                                        toggleSelect(q.id);
                                    }}>
                                        <div className="flex items-start gap-3 cursor-pointer">
                                            <FileQuestion className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="text-[#0A1B3C] font-medium line-clamp-2">{q.content}</p>
                                                <span className="text-xs text-gray-400 mt-1 block">
                                                    Created {new Date(q.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {q.tags.map(tag => (
                                                <span key={tag} className={`px-2 py-0.5 text-xs rounded border ${tag.toUpperCase().startsWith('PT')
                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleEditQuestion(q)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(q.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredQuestions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <FileQuestion className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-[#0A1B3C] mb-1">
                            {questions.length === 0 ? 'No questions yet' : 'No matching questions'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            {questions.length === 0
                                ? 'Get started by creating a new question.'
                                : 'Try adjusting your search or filters.'}
                        </p>
                        {questions.length === 0 && (
                            <button
                                onClick={handleAddQuestion}
                                className="px-4 py-2 bg-[#F37022] text-white rounded-lg text-sm font-semibold hover:bg-[#D96419]"
                            >
                                <Plus className="w-4 h-4 inline mr-1" /> Add First Question
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Question Modal */}
            <QuestionModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingQuestion(null); }}
                onSave={handleSaveQuestion}
                editData={editingQuestion}
            />

            {/* Import Preview Modal */}
            <ImportPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => { setIsPreviewModalOpen(false); setImportPreviewData(null); }}
                previewData={importPreviewData}
                onConfirm={handleConfirmImport}
                isImporting={isImporting}
            />

            {/* Delete Confirmation */}
            {
                deleteId && createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                        <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-7 h-7 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0A1B3C] mb-2">Delete Question?</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteQuestion(deleteId)}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }

            {/* Bulk Delete Confirmation */}
            {
                bulkDeleteConfirmOpen && createPortal(
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setBulkDeleteConfirmOpen(false)} />
                        <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-7 h-7 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-[#0A1B3C] mb-2">Delete Selected?</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setBulkDeleteConfirmOpen(false)}
                                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700"
                                >
                                    Delete All
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )
            }
        </div >
    );
}

export default AdminQuestionBankDetail;
