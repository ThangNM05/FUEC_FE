import { useNavigate } from 'react-router';
import { BookOpen, ChevronRight, Search, FileQuestion, Plus } from 'lucide-react';

interface SubjectInfo {
    id: string;
    code: string;
    name: string;
    questionCount: number;
    lastUpdated: string;
}

function TeacherQuestionBanks() {
    const navigate = useNavigate();

    // Mock subjects data
    const subjects: SubjectInfo[] = [
        {
            id: 'SE101',
            code: 'SE101',
            name: 'Software Engineering Foundation',
            questionCount: 150,
            lastUpdated: '2025-02-20',
        },
        {
            id: 'CS201',
            code: 'CS201',
            name: 'Data Structures and Algorithms',
            questionCount: 200,
            lastUpdated: '2025-02-18',
        },
        {
            id: 'DB301',
            code: 'DB301',
            name: 'Database Systems',
            questionCount: 85,
            lastUpdated: '2025-02-25',
        },
    ];

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-[#0A1B3C]">Question Banks</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage questions for your teaching subjects</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* List of Subjects */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.map((subject) => (
                    <div
                        key={subject.id}
                        className="bg-white rounded-xl border border-gray-200 hover:border-orange-300 transition-colors cursor-pointer group flex flex-col h-full"
                        onClick={() => navigate(`/teacher/question-banks/${subject.id}`)}
                    >
                        <div className="p-5 flex-1 relative overflow-hidden">
                            {/* Decorative highlight */}
                            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-100/50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                                    {subject.code}
                                </span>
                            </div>

                            <div className="relative z-10">
                                <h3 className="font-semibold text-lg text-[#0A1B3C] mb-2 line-clamp-2" title={subject.name}>
                                    {subject.name}
                                </h3>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                                    <span className="flex items-center gap-1.5 flex-1">
                                        <FileQuestion className="w-4 h-4" />
                                        {subject.questionCount} Questions
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50/50 rounded-b-xl">
                            <span className="text-xs text-gray-500">
                                Updated: {new Date(subject.lastUpdated).toLocaleDateString()}
                            </span>
                            <span className="flex items-center text-sm font-medium text-orange-600 group-hover:translate-x-1 transition-transform">
                                View Bank <ChevronRight className="w-4 h-4 ml-0.5" />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {subjects.length === 0 && (
                <div className="bg-white text-center py-12 rounded-xl border border-gray-200">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-[#0A1B3C] mb-2">No subjects assigned</h3>
                    <p className="text-gray-500 mb-6">You are not currently assigned to any subjects that have a question bank.</p>
                </div>
            )}
        </div>
    );
}

export default TeacherQuestionBanks;
