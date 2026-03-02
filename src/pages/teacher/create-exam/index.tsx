import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
    ChevronRight, ChevronLeft, Clock, FileQuestion, CheckSquare,
    Search, Filter, GripVertical, Trash2, Settings, Eye, Save
} from 'lucide-react';

interface Question {
    id: string;
    content: string;
    type: 'multiple_choice' | 'true_false' | 'essay';
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    points?: number;
}

// Mock question bank
const questionBank: Question[] = [
    { id: 'q1', content: 'Which of the following describes the waterfall model?', type: 'multiple_choice', difficulty: 'easy', tags: ['SDLC', 'Waterfall'] },
    { id: 'q2', content: 'Agile manifesto prioritizes comprehensive documentation over working software.', type: 'true_false', difficulty: 'easy', tags: ['Agile'] },
    { id: 'q3', content: 'Explain the difference between functional and non-functional requirements.', type: 'essay', difficulty: 'medium', tags: ['Requirements'] },
    { id: 'q4', content: 'What design pattern creates a single instance of a class?', type: 'multiple_choice', difficulty: 'medium', tags: ['Design Patterns', 'Singleton'] },
    { id: 'q5', content: 'The Open/Closed Principle states that software entities should be open for modification.', type: 'true_false', difficulty: 'hard', tags: ['SOLID', 'OCP'] },
    { id: 'q6', content: 'Which SOLID principle does SRP stand for?', type: 'multiple_choice', difficulty: 'easy', tags: ['SOLID'] },
    { id: 'q7', content: 'Describe the MVC architecture pattern and its components.', type: 'essay', difficulty: 'medium', tags: ['Architecture', 'MVC'] },
    { id: 'q8', content: 'In Scrum, a sprint typically lasts between 1 to 4 weeks.', type: 'true_false', difficulty: 'easy', tags: ['Agile', 'Scrum'] },
    { id: 'q9', content: 'Which testing technique examines internal structure of code?', type: 'multiple_choice', difficulty: 'hard', tags: ['Testing', 'WhiteBox'] },
    { id: 'q10', content: 'Compare and contrast Agile and Waterfall methodologies.', type: 'essay', difficulty: 'hard', tags: ['SDLC', 'Agile'] },
];

const subjects = [
    { id: 'SE101', name: 'Software Engineering Foundation' },
    { id: 'CS201', name: 'Data Structures and Algorithms' },
    { id: 'DB301', name: 'Database Systems' },
];

function CreateExam() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preSelectedSubject = searchParams.get('subject') || '';

    const [step, setStep] = useState(1);

    // Step 1: Config
    const [config, setConfig] = useState({
        title: '',
        subject: preSelectedSubject,
        duration: 60,
        totalPoints: 100,
        instructions: '',
    });

    // Step 2: Select Questions
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [questionPoints, setQuestionPoints] = useState<Record<string, number>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');

    // ─── Helpers ───
    const selectedQuestions = questionBank.filter(q => selectedIds.has(q.id));
    const totalAssignedPoints = selectedQuestions.reduce((sum, q) => sum + (questionPoints[q.id] || 10), 0);

    const toggleQuestion = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const filteredBank = questionBank.filter(q => {
        const matchSearch = !searchQuery || q.content.toLowerCase().includes(searchQuery.toLowerCase()) || q.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchType = !filterType || q.type === filterType;
        const matchDiff = !filterDifficulty || q.difficulty === filterDifficulty;
        return matchSearch && matchType && matchDiff;
    });

    const getDifficultyColor = (d: string) => {
        if (d === 'easy') return 'bg-green-100 text-green-700';
        if (d === 'medium') return 'bg-yellow-100 text-yellow-700';
        return 'bg-red-100 text-red-700';
    };

    const getTypeLabel = (t: string) => {
        if (t === 'multiple_choice') return 'MC';
        if (t === 'true_false') return 'T/F';
        return 'Essay';
    };

    const getTypeColor = (t: string) => {
        if (t === 'multiple_choice') return 'bg-blue-50 text-blue-700';
        if (t === 'true_false') return 'bg-purple-50 text-purple-700';
        return 'bg-orange-50 text-orange-700';
    };

    const canProceed = () => {
        if (step === 1) return config.title.trim() && config.subject;
        if (step === 2) return selectedIds.size > 0;
        return true;
    };

    const handleSave = () => {
        alert('Exam created successfully! (Mock — this would save to backend)');
        navigate('/teacher/question-banks');
    };

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                <button onClick={() => navigate('/teacher')} className="hover:text-[#F37022]">Home</button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => navigate('/teacher/question-banks')} className="hover:text-[#F37022]">Question Banks</button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">Create Exam</span>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl font-bold text-[#0A1B3C]">Create New Exam</h1>
                <div className="text-sm text-gray-500">
                    {selectedIds.size} questions • {totalAssignedPoints} pts
                </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-0 mb-8">
                {[
                    { n: 1, label: 'Configure', icon: Settings },
                    { n: 2, label: 'Select Questions', icon: CheckSquare },
                    { n: 3, label: 'Review', icon: Eye },
                ].map((s, idx) => (
                    <div key={s.n} className="flex items-center flex-1">
                        <button
                            onClick={() => s.n < step && setStep(s.n)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all w-full justify-center ${step === s.n
                                ? 'bg-[#F37022] text-white shadow-sm'
                                : step > s.n
                                    ? 'bg-green-50 text-green-700 hover:bg-green-100'
                                    : 'bg-gray-100 text-gray-400'
                                }`}
                        >
                            <s.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{s.label}</span>
                            <span className="sm:hidden">{s.n}</span>
                        </button>
                        {idx < 2 && <div className={`w-8 h-0.5 flex-shrink-0 ${step > s.n ? 'bg-green-300' : 'bg-gray-200'}`} />}
                    </div>
                ))}
            </div>

            {/* ═══ Step 1: Configure ═══ */}
            {step === 1 && (
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Exam Title *</label>
                            <input
                                value={config.title}
                                onChange={e => setConfig(c => ({ ...c, title: e.target.value }))}
                                placeholder="e.g. Midterm Exam - Spring 2025"
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022]"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                                <select
                                    value={config.subject}
                                    onChange={e => setConfig(c => ({ ...c, subject: e.target.value }))}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022]"
                                >
                                    <option value="">Select subject...</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        value={config.duration}
                                        onChange={e => setConfig(c => ({ ...c, duration: parseInt(e.target.value) || 0 }))}
                                        min={5}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022]"
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Instructions (optional)</label>
                            <textarea
                                value={config.instructions}
                                onChange={e => setConfig(c => ({ ...c, instructions: e.target.value }))}
                                rows={3}
                                placeholder="Enter any special instructions for students..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F37022] resize-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Step 2: Select Questions ═══ */}
            {step === 2 && (
                <div className="space-y-4">
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search questions..."
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                                <option value="">All Types</option>
                                <option value="multiple_choice">MC</option>
                                <option value="true_false">T/F</option>
                                <option value="essay">Essay</option>
                            </select>
                            <select value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm">
                                <option value="">All</option>
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    {/* Selection summary */}
                    {selectedIds.size > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-orange-800">
                                {selectedIds.size} question{selectedIds.size > 1 ? 's' : ''} selected
                            </span>
                            <button
                                onClick={() => setSelectedIds(new Set())}
                                className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                            >
                                Clear all
                            </button>
                        </div>
                    )}

                    {/* Question Bank List */}
                    <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                        {filteredBank.map(q => {
                            const isSelected = selectedIds.has(q.id);
                            return (
                                <div
                                    key={q.id}
                                    onClick={() => toggleQuestion(q.id)}
                                    className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${isSelected ? 'bg-orange-50/50' : 'hover:bg-gray-50'}`}
                                >
                                    {/* Checkbox */}
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isSelected ? 'bg-[#F37022] border-[#F37022]' : 'border-gray-300'}`}>
                                        {isSelected && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#0A1B3C] line-clamp-2">{q.content}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(q.type)}`}>{getTypeLabel(q.type)}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                                            {q.tags.slice(0, 2).map(t => (
                                                <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded">{t}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══ Step 3: Review ═══ */}
            {step === 3 && (
                <div className="space-y-6">
                    {/* Exam Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-[#0A1B3C] mb-4">Exam Summary</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-[#0A1B3C]">{config.title || '—'}</div>
                                <div className="text-xs text-gray-500">Title</div>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-[#F37022]">{selectedQuestions.length}</div>
                                <div className="text-xs text-gray-500">Questions</div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-blue-700">{totalAssignedPoints}</div>
                                <div className="text-xs text-gray-500">Total Points</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-green-700">{config.duration} min</div>
                                <div className="text-xs text-gray-500">Duration</div>
                            </div>
                        </div>
                    </div>

                    {/* Question List with Points */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="font-semibold text-[#0A1B3C]">Questions ({selectedQuestions.length})</h3>
                            <span className="text-sm text-gray-500">Assign points per question</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {selectedQuestions.map((q, idx) => (
                                <div key={q.id} className="flex items-center gap-3 px-6 py-4">
                                    <span className="text-sm font-bold text-gray-400 w-6">{idx + 1}.</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-[#0A1B3C] font-medium line-clamp-1">{q.content}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(q.type)}`}>{getTypeLabel(q.type)}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>{q.difficulty}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <input
                                            type="number"
                                            value={questionPoints[q.id] || 10}
                                            onChange={e => setQuestionPoints(p => ({ ...p, [q.id]: parseInt(e.target.value) || 0 }))}
                                            min={1}
                                            className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#F37022]"
                                        />
                                        <span className="text-xs text-gray-400">pts</span>
                                        <button
                                            onClick={() => toggleQuestion(q.id)}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg ml-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                    onClick={() => step === 1 ? navigate(-1) : setStep(step - 1)}
                    className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    <ChevronLeft className="w-4 h-4" />
                    {step === 1 ? 'Cancel' : 'Back'}
                </button>
                {step < 3 ? (
                    <button
                        onClick={() => setStep(step + 1)}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#F37022] text-white rounded-xl text-sm font-semibold hover:bg-[#D96419] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 shadow-sm"
                    >
                        <Save className="w-4 h-4" /> Create Exam
                    </button>
                )}
            </div>
        </div>
    );
}

export default CreateExam;
