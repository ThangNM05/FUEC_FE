import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
    ChevronRight,
    ChevronDown,
    Search,
    Plus,
    Upload,
    FileQuestion,
    FileSpreadsheet,
    FileText,
    BookOpen,
    Edit2,
    Trash2,
    Download,
} from 'lucide-react';
import QuestionModal, { type QuestionData } from '../../../components/modals/QuestionModal';
import ImportPreviewModal from '../../../components/modals/ImportPreviewModal';
import ImportQuestionBankModal from '../../../components/shared/ImportQuestionBankModal';
import ConfirmDeleteModal from '../../../components/shared/ConfirmDeleteModal';
import {
    useGetQuestionsQuery,
    useCreateQuestionMutation,
    useUpdateQuestionMutation,
    useDeleteQuestionMutation,
    useDeleteQuestionsMutation,
    usePreviewImportQuestionsMutation,
    usePreviewImportGiftMutation,
    useImportQuestionsMutation,
    type ImportPreviewResult,
    type ImportPreviewQuestion,
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
    correctAnswers?: number[];
    createdAt: string;
    chapter: number;
}

const subjectNames: Record<string, string> = {
    SE101: 'Software Engineering Foundation',
    CS201: 'Data Structures and Algorithms',
    DB301: 'Database Systems',
    AI101: 'Introduction to AI',
    MKT101: 'Marketing Principles',
};

function isGiftFile(file: File): boolean {
    const name = file.name.toLowerCase();
    return name.endsWith('.gift') || name.endsWith('.txt');
}

function TeacherQuestionBankDetail() {
    const navigate = useNavigate();
    const { subjectId } = useParams();
    const subjectName = subjectNames[subjectId || ''] || 'Subject Details';

    const { data: subjectData } = useGetSubjectByCodeQuery(subjectId || '', { skip: !subjectId });
    const actualSubjectId = subjectData?.id || '';

    // ── Import: single modal, two possible API calls ──────────────────────
    const [previewImport, { isLoading: isPreviewing }] = usePreviewImportQuestionsMutation();
    const [previewImportGift, { isLoading: isPreviewingGift }] = usePreviewImportGiftMutation();
    const [importQuestions, { isLoading: isImporting }] = useImportQuestionsMutation();

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
    const [importPreviewData, setImportPreviewData] = useState<ImportPreviewResult | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const isBusy = isPreviewing || isPreviewingGift || isImporting;

    /** Called by ImportQuestionBankModal with the chosen file (+ optional defaultChapter for GIFT) */
    const handleConfirmFile = async (file: File, defaultChapter?: number) => {
        const formData = new FormData();
        formData.append('file', file);
        if (subjectId) formData.append('expectedSubjectCode', subjectId);

        try {
            let result: ImportPreviewResult;

            if (isGiftFile(file)) {
                if (defaultChapter !== undefined) {
                    formData.append('defaultChapter', String(defaultChapter));
                }
                result = await previewImportGift(formData).unwrap();
            } else {
                result = await previewImport(formData).unwrap();
            }

            if (result.errors?.length > 0 && result.questions.length === 0) {
                toast.error(result.errors[0]);
                return;
            }

            setImportPreviewData(result);
            setIsImportModalOpen(false);
            setIsPreviewModalOpen(true);
        } catch {
            toast.error('Failed to parse file. Please check the format.');
        }
    };

    /** Called by ImportPreviewModal after the user selects which questions to save */
    const handleConfirmImport = async (selectedQuestions: ImportPreviewQuestion[]) => {
        if (!importPreviewData) return;
        try {
            const result = await importQuestions({
                subjectCode: importPreviewData.subjectCode,
                selectedQuestions,
            }).unwrap();
            toast.success(
                `Imported ${result.questionsCreated} question${result.questionsCreated !== 1 ? 's' : ''} successfully!`,
            );
            setIsPreviewModalOpen(false);
            setImportPreviewData(null);
            refetch();
        } catch {
            toast.error('Failed to import questions.');
        }
    };

    // ── Questions data ────────────────────────────────────────────────────
    const {
        data: questionsData,
        isLoading,
        refetch,
    } = useGetQuestionsQuery({
        subjectCode: subjectId,
        pageSize: 1000,
    });
    const [createQuestion] = useCreateQuestionMutation();
    const [updateQuestion] = useUpdateQuestionMutation();
    const [deleteQuestion] = useDeleteQuestionMutation();
    const [deleteQuestions] = useDeleteQuestionsMutation();

    const questions: Question[] = (questionsData?.items || []).map((q) => {
        const options = q.options || [];
        const tags = q.tag ? q.tag.split(',').map((t: string) => t.trim()) : [];
        const correctAnswers = options.map((o: any, idx: number) => o.isCorrect ? idx : -1).filter((i: number) => i !== -1);
        return {
            id: q.id,
            content: q.questionContent,
            tags,
            options: options.map((o: any) => o.choiceContent || ''),
            correctAnswers: correctAnswers,
            createdAt: q.createdAt,
            chapter: q.chapter || 1,
            rawOptions: options,
        } as any;
    });

    // ── Local UI state ────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPT, setSelectedPT] = useState('All');
    const [selectedChapter, setSelectedChapter] = useState<number | 'All'>('All');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const allPTs = Array.from(
        new Set(
            questions.flatMap((q: any) => q.tags.filter((t: string) => t.toUpperCase().startsWith('PT'))),
        ),
    ).sort();
    const ptTabs = ['All', ...allPTs];
    const allChapters = Array.from(new Set(questions.map((q: any) => q.chapter as number))).sort(
        (a, b) => a - b,
    );

    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

    // ── CRUD ─────────────────────────────────────────────────────────────
    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setModalOpen(true);
    };

    const handleEditQuestion = (q: any) => {
        setEditingQuestion({
            id: q.id,
            content: q.content,
            tags: q.tags,
            options: q.options,
            correctAnswers: q.correctAnswers,
            chapter: q.chapter,
            rawOptions: q.rawOptions,
        } as any);
        setModalOpen(true);
    };

    const handleSaveQuestion = async (data: any) => {
        try {
            const mappedOptions =
                data.options?.map((optContent: string, index: number) => {
                    const isCorrect = data.correctAnswers?.includes(index) ?? false;
                    const existingOpt = data.rawOptions?.[index];
                    if (existingOpt) return { id: existingOpt.id, choiceContent: optContent, isCorrect };
                    return { choiceContent: optContent, isCorrect };
                }) || [];

            const questionType = data.correctAnswers && data.correctAnswers.length > 1 ? 1 : 0;

            if (data.id) {
                await updateQuestion({
                    id: data.id,
                    body: {
                        questionContent: data.content,
                        questionType: questionType,
                        tag: data.tags.join(','),
                        points: 1.0,
                        chapter: data.chapter,
                        options: mappedOptions,
                    },
                }).unwrap();
            } else {
                if (!actualSubjectId) return;
                await createQuestion({
                    questionContent: data.content,
                    questionType: questionType,
                    subjectId: actualSubjectId,
                    tag: data.tags.join(','),
                    points: 1.0,
                    chapter: data.chapter,
                    options: mappedOptions,
                }).unwrap();
            }
            setModalOpen(false);
            setEditingQuestion(null);
            refetch();
        } catch (error) {
            console.error('Failed to save question:', error);
        }
    };

    const handleDeleteQuestion = async (id: string) => {
        try {
            await deleteQuestion(id).unwrap();
            setDeleteId(null);
            refetch();
            if (selectedIds.has(id)) {
                setSelectedIds((prev) => {
                    const next = new Set(prev);
                    next.delete(id);
                    return next;
                });
            }
        } catch (error) {
            console.error('Failed to delete question', error);
        }
    };

    const handleBulkDelete = async () => {
        try {
            await deleteQuestions(Array.from(selectedIds)).unwrap();
            toast.success(
                `${selectedIds.size} question${selectedIds.size !== 1 ? 's' : ''} deleted successfully!`,
            );
            setSelectedIds(new Set());
            setBulkDeleteConfirmOpen(false);
            refetch();
        } catch {
            toast.error('Failed to delete selected questions.');
        }
    };

    // ── Filtering ─────────────────────────────────────────────────────────
    const filteredQuestions = questions.filter((q: any) => {
        const matchesSearch =
            !searchQuery ||
            q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.tags.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesPT = selectedPT === 'All' || q.tags.includes(selectedPT);
        const matchesChapter = selectedChapter === 'All' || q.chapter === selectedChapter;
        return matchesSearch && matchesPT && matchesChapter;
    });

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
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

    const isAllSelected =
        filteredQuestions.length > 0 && selectedIds.size === filteredQuestions.length;

    // ── Render ────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="p-4 md:p-6 flex flex-col items-center justify-center h-64 gap-4">
                <div className="w-12 h-12 border-4 border-[#F37022] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <button
                    onClick={() => navigate('/teacher')}
                    className="hover:text-[#F37022] transition-colors"
                >
                    Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <button
                    onClick={() => navigate('/teacher/question-banks')}
                    className="hover:text-[#F37022] transition-colors"
                >
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
                    {/* Download Template Dropdown */}
                    <div
                        className="relative"
                        onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                                setIsTemplateDropdownOpen(false);
                            }
                        }}
                    >
                        <button
                            onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-xs sm:text-sm font-medium hover:bg-gray-50 transition-colors bg-white"
                        >
                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Download Template</span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${isTemplateDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </button>
                        {isTemplateDropdownOpen && (
                            <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl border border-gray-200 shadow-lg z-20 py-1.5 overflow-hidden">
                                <a
                                    href="/templates/question_bank_template.xlsx"
                                    download
                                    onClick={() => setIsTemplateDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium">Excel Format</div>
                                        <div className="text-xs text-gray-400">.xlsx template</div>
                                    </div>
                                </a>
                                <a
                                    href="/templates/question_bank.gift"
                                    download
                                    onClick={() => setIsTemplateDropdownOpen(false)}
                                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                >
                                    <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <div>
                                        <div className="font-medium">GIFT Format</div>
                                        <div className="text-xs text-gray-400">.gift template</div>
                                    </div>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Single Import button */}
                    <button
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 border-2 border-[#F37022] text-[#F37022] rounded-lg text-xs sm:text-sm font-medium hover:bg-orange-50 transition-colors bg-white disabled:opacity-60"
                        onClick={() => setIsImportModalOpen(true)}
                        disabled={isBusy}
                    >
                        {isBusy ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#F37022] border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                        <span className="hidden sm:inline">
                            {isPreviewing || isPreviewingGift
                                ? 'Parsing...'
                                : isImporting
                                    ? 'Importing...'
                                    : 'Import'}
                        </span>
                    </button>

                    {/* Add Question */}
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
                {ptTabs.map((pt) => {
                    const count =
                        pt === 'All' ? questions.length : questions.filter((q) => q.tags.includes(pt)).length;
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
                            <span
                                className={`px-1.5 py-0.5 rounded-full text-xs ${selectedPT === pt ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}
                            >
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Search */}
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
                <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={selectedChapter === 'All' ? 'All' : String(selectedChapter)}
                        onChange={(e) =>
                            setSelectedChapter(e.target.value === 'All' ? 'All' : Number(e.target.value))
                        }
                        className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-gray-700 appearance-none cursor-pointer min-w-[150px]"
                    >
                        <option value="All">All Chapters</option>
                        {allChapters.map((ch) => (
                            <option key={ch} value={ch}>
                                Chapter {ch}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Questions Table */}
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
                                <th className="px-6 py-4 text-center">Chapter</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Tags</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredQuestions.map((q) => (
                                <tr
                                    key={q.id}
                                    className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.has(q.id) ? 'bg-orange-50/30' : ''}`}
                                >
                                    <td className="px-6 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(q.id)}
                                            onChange={() => toggleSelect(q.id)}
                                            className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                        />
                                    </td>
                                    <td className="px-6 py-4 cursor-pointer" onClick={() => toggleSelect(q.id)}>
                                        <div className="flex items-start gap-3">
                                            <FileQuestion className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <div className="min-w-0">
                                                <p className="text-[#0A1B3C] font-medium line-clamp-2">{q.content}</p>
                                                <span className="text-xs text-gray-400 mt-1 block">
                                                    Created {new Date(q.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg border border-gray-200">
                                            Ch. {q.chapter}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {q.tags.map((tag: string) => (
                                                <span
                                                    key={tag}
                                                    className={`px-2 py-0.5 text-xs rounded border ${tag.toUpperCase().startsWith('PT')
                                                            ? 'bg-blue-50 text-blue-700 border-blue-200 font-medium'
                                                            : 'bg-gray-100 text-gray-600 border-gray-200'
                                                        }`}
                                                >
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
                                ? 'Get started by creating a new question or importing a file.'
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

            {/* ── Modals ──────────────────────────────────────────────────── */}

            {/* Question create/edit modal */}
            <QuestionModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingQuestion(null);
                }}
                onSave={handleSaveQuestion}
                editData={editingQuestion}
            />

            {/* Unified import modal (Excel + GIFT) */}
            <ImportQuestionBankModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onConfirm={handleConfirmFile}
                subjectCode={subjectId}
                isPreviewing={isPreviewing || isPreviewingGift}
            />

            {/* Preview → confirm import */}
            <ImportPreviewModal
                isOpen={isPreviewModalOpen}
                onClose={() => {
                    setIsPreviewModalOpen(false);
                    setImportPreviewData(null);
                }}
                previewData={importPreviewData}
                onConfirm={handleConfirmImport}
                isImporting={isImporting}
            />

            {/* Single-delete confirmation */}
            <ConfirmDeleteModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && handleDeleteQuestion(deleteId)}
                title="Delete Question?"
                message="This action cannot be undone. This will permanently delete this question from the bank."
                confirmButtonLabel="Delete"
            />

            {/* Bulk-delete confirmation */}
            <ConfirmDeleteModal
                isOpen={bulkDeleteConfirmOpen}
                onClose={() => setBulkDeleteConfirmOpen(false)}
                onConfirm={handleBulkDelete}
                title="Delete Selected Questions?"
                message={`Are you sure you want to delete ${selectedIds.size} selected questions? This action cannot be undone.`}
                confirmButtonLabel="Delete All"
            />
        </div>
    );
}

export default TeacherQuestionBankDetail;
