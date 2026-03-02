import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
    ChevronRight, Search, Plus, Upload, Filter,
    FileQuestion, Edit2, Trash2, ClipboardList
} from 'lucide-react';
import QuestionModal, { type QuestionData } from '../../../components/modals/QuestionModal';

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
};

const initialQuestions: Question[] = [
    {
        id: 'q1',
        content: 'Which of the following describes the waterfall model?',
        type: 'multiple_choice',
        difficulty: 'easy',
        tags: ['SDLC', 'Waterfall'],
        options: ['A linear sequential approach', 'An iterative approach', 'A prototype-based approach', 'A random approach'],
        correctAnswer: 0,
        createdAt: '2025-02-15',
    },
    {
        id: 'q2',
        content: 'Agile manifesto prioritizes comprehensive documentation over working software.',
        type: 'true_false',
        difficulty: 'easy',
        tags: ['Agile'],
        options: ['True', 'False'],
        correctAnswer: 1,
        createdAt: '2025-02-16',
    },
    {
        id: 'q3',
        content: 'Explain the difference between functional and non-functional requirements with examples.',
        type: 'essay',
        difficulty: 'medium',
        tags: ['Requirements'],
        createdAt: '2025-02-20',
    },
    {
        id: 'q4',
        content: 'What design pattern should be used when you want a single instance of a class?',
        type: 'multiple_choice',
        difficulty: 'medium',
        tags: ['Design Patterns', 'Singleton'],
        options: ['Singleton', 'Factory', 'Observer', 'Strategy'],
        correctAnswer: 0,
        createdAt: '2025-02-22',
    },
    {
        id: 'q5',
        content: 'The Open/Closed Principle states that software entities should be open for modification.',
        type: 'true_false',
        difficulty: 'hard',
        tags: ['SOLID', 'OCP'],
        options: ['True', 'False'],
        correctAnswer: 1,
        createdAt: '2025-02-24',
    },
];

function TeacherQuestionBankDetail() {
    const navigate = useNavigate();
    const { subjectId } = useParams();
    const subjectName = subjectNames[subjectId || ''] || 'Subject Details';

    // CRUD State
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');

    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null);

    // Delete Confirm State
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // ─── CRUD Operations ───
    const handleAddQuestion = () => {
        setEditingQuestion(null);
        setModalOpen(true);
    };

    const handleEditQuestion = (q: Question) => {
        setEditingQuestion({
            id: q.id,
            content: q.content,
            type: q.type,
            difficulty: q.difficulty,
            tags: q.tags,
            options: q.options,
            correctAnswer: q.correctAnswer,
        });
        setModalOpen(true);
    };

    const handleSaveQuestion = (data: QuestionData) => {
        if (data.id) {
            // Update
            setQuestions(prev => prev.map(q =>
                q.id === data.id
                    ? { ...q, ...data, createdAt: q.createdAt }
                    : q
            ));
        } else {
            // Create
            const newQ: Question = {
                ...data,
                id: `q${Date.now()}`,
                createdAt: new Date().toISOString().split('T')[0],
            };
            setQuestions(prev => [newQ, ...prev]);
        }
        setModalOpen(false);
        setEditingQuestion(null);
    };

    const handleDeleteQuestion = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
        setDeleteId(null);
    };

    // ─── Filtering ───
    const filteredQuestions = questions.filter(q => {
        const matchesSearch = !searchQuery ||
            q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = !filterType || q.type === filterType;
        const matchesDifficulty = !filterDifficulty || q.difficulty === filterDifficulty;
        return matchesSearch && matchesType && matchesDifficulty;
    });

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

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <button onClick={() => navigate('/teacher')} className="hover:text-[#F37022] transition-colors">
                    Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => navigate('/teacher/question-banks')} className="hover:text-[#F37022] transition-colors">
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
                    <p className="text-gray-500 text-sm mt-1">{questions.length} questions in bank</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors bg-white">
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Import</span>
                    </button>
                    <button
                        onClick={() => navigate(`/teacher/create-exam?subject=${subjectId}`)}
                        className="flex items-center gap-2 px-4 py-2 border border-[#F37022] text-[#F37022] rounded-lg hover:bg-orange-50 transition-colors bg-white"
                    >
                        <ClipboardList className="w-4 h-4" />
                        <span>Create Exam</span>
                    </button>
                    <button
                        onClick={handleAddQuestion}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F37022] text-white rounded-lg hover:bg-[#D96419] transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Question</span>
                    </button>
                </div>
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
                <div className="flex gap-2">
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">All Types</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="essay">Essay</option>
                    </select>
                    <select
                        value={filterDifficulty}
                        onChange={e => setFilterDifficulty(e.target.value)}
                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                        <option value="">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Total', value: questions.length, color: 'bg-gray-50 text-gray-700' },
                    { label: 'Easy', value: questions.filter(q => q.difficulty === 'easy').length, color: 'bg-green-50 text-green-700' },
                    { label: 'Medium', value: questions.filter(q => q.difficulty === 'medium').length, color: 'bg-yellow-50 text-yellow-700' },
                    { label: 'Hard', value: questions.filter(q => q.difficulty === 'hard').length, color: 'bg-red-50 text-red-700' },
                ].map(s => (
                    <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                        <div className="text-2xl font-bold">{s.value}</div>
                        <div className="text-xs font-medium opacity-70">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Questions List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                                <th className="px-6 py-4">Question Content</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Difficulty</th>
                                <th className="px-6 py-4 hidden lg:table-cell">Tags</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredQuestions.map((q) => (
                                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
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
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${getTypeColor(q.type)}`}>
                                            {getTypeDisplay(q.type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getDifficultyColor(q.difficulty)}`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {q.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
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

            {/* Delete Confirmation */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-4 text-center">
                        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 className="w-7 h-7 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-[#0A1B3C] mb-2">Delete Question?</h3>
                        <p className="text-sm text-gray-500 mb-6">This action cannot be undone. The question will be permanently removed.</p>
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
                </div>
            )}
        </div>
    );
}

export default TeacherQuestionBankDetail;
