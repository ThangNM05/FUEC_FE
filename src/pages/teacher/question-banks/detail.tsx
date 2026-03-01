import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
    ChevronRight, Search, Plus, Upload, Filter,
    FileQuestion, MoreVertical, Edit2, Trash2
} from 'lucide-react';

interface Question {
    id: string;
    content: string;
    type: 'multiple_choice' | 'true_false' | 'essay';
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    createdAt: string;
}

function TeacherQuestionBankDetail() {
    const navigate = useNavigate();
    const { subjectId } = useParams();
    // Simulate subject info fetch
    const subjectName = subjectId === 'SE101' ? 'Software Engineering Foundation' : 'Subject Details';

    const [searchQuery, setSearchQuery] = useState('');

    // Mock questions data
    const questions: Question[] = [
        {
            id: 'q1',
            content: 'Which of the following describes the waterfall model?',
            type: 'multiple_choice',
            difficulty: 'easy',
            tags: ['SDLC', 'Waterfall'],
            createdAt: '2025-02-15',
        },
        {
            id: 'q2',
            content: 'Agile manifesto prioritizes comprehensive documentation over working software.',
            type: 'true_false',
            difficulty: 'easy',
            tags: ['Agile'],
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
            createdAt: '2025-02-22',
        }
    ];

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'hard': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getTypeDisplay = (type: string) => {
        switch (type) {
            case 'multiple_choice': return 'Multiple Choice';
            case 'true_false': return 'True/False';
            case 'essay': return 'Essay';
            default: return type;
        }
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
                    <p className="text-gray-500 text-sm mt-1">Manage all questions for this subject</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors bg-white">
                        <Upload className="w-4 h-4" />
                        <span className="hidden sm:inline">Import</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#F37022] text-white rounded-lg hover:bg-[#D96419] transition-colors shadow-sm">
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
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                    />
                </div>
                <div className="flex gap-2">
                    <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">All Types</option>
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True/False</option>
                        <option value="essay">Essay</option>
                    </select>
                    <select className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option value="">All Difficulties</option>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                    <button className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
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
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {questions.map((q) => (
                                <tr key={q.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <FileQuestion className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-[#0A1B3C] font-medium line-clamp-2">{q.content}</p>
                                                <span className="text-xs text-gray-400 mt-1 block">Created on {new Date(q.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-600">{getTypeDisplay(q.type)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${getDifficultyColor(q.difficulty)}`}>
                                            {q.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {q.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded border border-gray-200">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="More">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {questions.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <FileQuestion className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-[#0A1B3C] mb-1">No questions found</h3>
                        <p className="text-sm text-gray-400">Get started by creating a new question.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherQuestionBankDetail;
