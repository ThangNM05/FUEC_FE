import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
    ChevronRight,
    Send,
    Sparkles,
    CheckCircle,
    AlertCircle,
    BookOpen,
    TrendingUp,
    Calendar,
    Clock,
    ChevronDown,
    ChevronUp,
    FileText,
    Lock
} from 'lucide-react';
import { Button as AntButton } from 'antd';

interface AIFeedback {
    analysis: string;
    strengths: string[];
    improvements: string[];
    resources: string[];
    score: number;
    passed: boolean;
}

interface QuestionComment {
    id: string;
    author: string;
    content: string;
    timestamp: Date;
    aiFeedback?: AIFeedback;
}

interface SlotQuestion {
    id: number;
    title: string;
    status: 'custom' | 'finished';
}

interface Slot {
    id: number;
    title: string;
    status: 'locked' | 'completed' | 'pending' | 'urgent' | 'overdue';
    remaining?: string;
    questions: SlotQuestion[];
    expanded: boolean;
}

function QuestionDetail() {
    const navigate = useNavigate();
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [slotsExpanded, setSlotsExpanded] = useState(true);
    const [activeSection, setActiveSection] = useState('slot-contents');

    const question = {
        id: '1',
        slotId: 1,
        courseCode: 'PRN212',
        courseName: 'Mobile Programming',
        slotNumber: 1,
        title: 'What is android?',
        content: 'What is android?',
        slotTime: '12:30 10/09/2025 - 14:45 10/09/2025'
    };

    // Mock slots matching the image
    const getSlotStatus = (slotId: number): 'locked' | 'completed' | 'pending' | 'urgent' | 'overdue' => {
        if (slotId <= 5) return 'completed';
        if (slotId === 6) return 'overdue';
        if (slotId <= 8) return 'urgent';
        if (slotId <= 10) return 'pending';
        return 'locked';
    };

    const getRemaining = (slotId: number): string | undefined => {
        if (slotId === 6) return 'OVERDUE';
        if (slotId === 7) return '23 hours';
        if (slotId === 8) return '4 hours 30 min';
        if (slotId === 9) return '2 days';
        if (slotId === 10) return '5 days';
        return undefined;
    };

    const [slots, setSlots] = useState<Slot[]>(
        Array.from({ length: 15 }, (_, i) => ({
            id: i + 1,
            title: `Slot ${i + 1}`,
            status: getSlotStatus(i + 1),
            remaining: getRemaining(i + 1),
            expanded: i === 0, // Only slot 1 expanded
            questions: i === 0 ? [
                { id: 1, title: 'What is android?', status: 'finished' as const },
                { id: 2, title: 'What is Android Structure?', status: 'finished' as const },
                { id: 3, title: 'Explain android activity life cycle?', status: 'custom' as const }
            ] : [
                { id: 1, title: 'Question 1', status: 'finished' as const },
                { id: 2, title: 'Question 2', status: 'custom' as const }
            ]
        }))
    );

    const toggleSlot = (slotId: number) => {
        setSlots(slots.map(slot =>
            slot.id === slotId ? { ...slot, expanded: !slot.expanded } : slot
        ));
    };

    // Mock discussions with AI feedback
    const [discussions, setDiscussions] = useState<QuestionComment[]>([
        {
            id: '1',
            author: 'Trương Nguyễn Tiến Đạt',
            content: 'Android is an open-source mobile operating system developed by Google, based on the Linux kernel. It\'s mainly used for smartphones, tablets, smart TVs, and wearables. Provides a platform for developers to build apps using Java, Kotlin, or C++. Supports features like touch screen UI, multi-tasking, connectivity (Wi-Fi, Bluetooth, 5G), and access to hardware (camera, GPS, sensors). Apps are distributed through Google Play Store or other marketplaces.',
            timestamp: new Date('2025-09-17T12:09:48'),
            aiFeedback: {
                analysis: 'Excellent comprehensive answer! You\'ve covered all the key aspects of Android including its open-source nature, developer ecosystem, and major features.',
                strengths: [
                    'Clear mention of Android being open-source and based on Linux kernel',
                    'Good coverage of supported devices',
                    'Accurate description of programming languages',
                    'Well-explained key features'
                ],
                improvements: [],
                resources: [
                    'Android Developer Documentation - developer.android.com',
                    'Google I/O Android sessions'
                ],
                score: 9.5,
                passed: true
            }
        },
        {
            id: '2',
            author: 'Trương Anh Tuấn',
            content: 'Android is a mobile operating system.',
            timestamp: new Date('2025-09-17T14:30:00'),
            aiFeedback: {
                analysis: 'Your answer is too brief and lacks important details. While you correctly identified Android as a mobile operating system, you need to provide more comprehensive information.',
                strengths: [
                    'Correctly identified Android as a mobile operating system'
                ],
                improvements: [
                    'Add information about Android being open-source',
                    'Mention that it\'s developed by Google',
                    'Describe the Linux kernel foundation',
                    'Include programming languages (Java, Kotlin, C++)',
                    'Discuss supported devices and key features'
                ],
                resources: [
                    'Android Developer Official Documentation',
                    'Android Basics Course on Coursera'
                ],
                score: 3.5,
                passed: false
            }
        }
    ]);

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId);
    };

    // Simulate AI feedback generation
    const generateAIFeedback = (userAnswer: string): AIFeedback => {
        const words = userAnswer.toLowerCase();
        const hasAndroid = words.includes('android');
        const hasOpenSource = words.includes('open-source') || words.includes('open source');
        const hasGoogle = words.includes('google');
        const hasLinux = words.includes('linux');
        const hasApps = words.includes('app') || words.includes('application');

        let score = 5;
        const strengths: string[] = [];
        const improvements: string[] = [];

        if (hasAndroid) score += 1;
        if (hasOpenSource) {
            score += 1.5;
            strengths.push('Correctly identified Android as open-source');
        } else {
            improvements.push('Consider mentioning that Android is an open-source platform');
        }
        if (hasGoogle) {
            score += 1.5;
            strengths.push('Mentioned Google as the developer');
        } else {
            improvements.push('Could add that Android is developed by Google');
        }
        if (hasLinux) {
            score += 1;
            strengths.push('Good understanding of Android\'s Linux kernel foundation');
        } else {
            improvements.push('Consider mentioning Android is based on Linux kernel');
        }
        if (hasApps) {
            score += 1;
            strengths.push('Mentioned application development aspect');
        }

        if (userAnswer.length < 50) {
            score -= 1;
            improvements.push('Provide more detailed explanation with examples');
        } else if (userAnswer.length > 150) {
            strengths.push('Comprehensive and detailed answer');
        }

        const passed = score >= 7;
        let analysis = '';
        if (passed) {
            analysis = 'Great work! Your answer demonstrates good understanding of Android fundamentals. You\'ve covered the essential concepts clearly.';
        } else {
            analysis = 'Your answer needs improvement. Please review the course materials and provide more comprehensive information with specific details.';
        }

        return {
            analysis,
            strengths: strengths.length > 0 ? strengths : ['You attempted to answer the question'],
            improvements: improvements.length > 0 ? improvements : [],
            resources: [
                'Android Developer Official Documentation',
                'Android Basics Course on Coursera'
            ],
            score: Math.min(10, Math.max(0, score)),
            passed
        };
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim()) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const aiFeedback = generateAIFeedback(answer);
        const newComment: QuestionComment = {
            id: `comment-${Date.now()}`,
            author: 'YOU',
            content: answer,
            timestamp: new Date(),
            aiFeedback
        };

        setDiscussions([...discussions, newComment]);
        setIsSubmitting(false);
        setAnswer('');
    };

    const getScoreColor = (score: number) => {
        if (score >= 9) return 'text-green-600';
        if (score >= 7) return 'text-blue-600';
        if (score >= 5) return 'text-orange-600';
        return 'text-red-600';
    };

    return (
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 relative p-4 md:p-6 animate-fadeIn">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <button onClick={() => navigate('/student')} className="hover:text-[#F37022] transition-colors">
                        Home
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <button onClick={() => navigate(`/student/course-details?code=${question.courseCode}`)} className="hover:text-[#F37022] transition-colors">
                        {question.courseName}
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <button onClick={() => navigate(`/student/course-details?code=${question.courseCode}`)} className="hover:text-[#F37022] transition-colors">
                        Slot {question.slotNumber}
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-[#0A1B3C] font-medium">{question.title}</span>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-2">{question.title}</h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>{question.slotTime}</span>
                        </div>
                    </div>
                </div>

                {/* Question Content */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-[#0A1B3C] mb-4">Content</h2>
                    <p className="text-gray-700">{question.content}</p>
                </div>

                {/* Discussion */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-[#0A1B3C] mb-6">Discussion</h2>

                    {/* Answer Submission */}
                    <div className="space-y-3 mb-6">
                        <label className="block text-sm font-semibold text-[#0A1B3C]">
                            Your Answer
                        </label>
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Write your answer here..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-[#F37022] focus:ring-2 focus:ring-orange-100 outline-none resize-none transition-all"
                            rows={6}
                        />
                        <div className="flex items-center justify-end">
                            <AntButton
                                type="primary"
                                onClick={handleSubmitAnswer}
                                loading={isSubmitting}
                                disabled={!answer.trim()}
                                className="flex items-center gap-2 h-10 px-6 bg-[#F37022] hover:bg-[#D96419] border-none text-white font-semibold rounded-lg transition-all hover-lift"
                                icon={!isSubmitting && <Send className="w-4 h-4" />}
                            >
                                {isSubmitting ? 'Processing...' : 'Submit Answer'}
                            </AntButton>
                        </div>
                    </div>

                    {/* Discussions List */}
                    <div className="space-y-6">
                        {discussions.map((comment) => (
                            <div key={comment.id} className="animate-slideUp">
                                {/* Student Comment */}
                                <div>
                                    {/* Name and Timestamp - Outside box */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-xs font-semibold">
                                                {comment.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[#0A1B3C]">{comment.author}</p>
                                            <p className="text-xs text-gray-500">
                                                {comment.timestamp.toLocaleDateString()} {comment.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content Box */}
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>

                                {/* AI Assistant Reply (indented like a reply) */}
                                {comment.aiFeedback && (
                                    <div className="ml-8 mt-3">
                                        {/* AI Name and Timestamp - Outside box */}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 bg-gradient-to-br from-[#F37022] to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-[#0A1B3C]">FUEC AI Assistant</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date().toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Content Box */}
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                                {comment.aiFeedback.analysis}
                                            </p>
                                            <p className={`text-sm font-semibold ${comment.aiFeedback.passed ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {comment.aiFeedback.passed
                                                    ? '✓ Review passed - Great work!'
                                                    : '✗ Review not passed - Please resubmit with improvements.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Slot Questions Only */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <div className="sticky top-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <h3 className="font-bold text-[#0A1B3C] mb-1">Slot {question.slotNumber}</h3>

                        {/* Questions List */}
                        <div className="space-y-1">
                            {slots[0].questions.map(q => (
                                <button
                                    key={q.id}
                                    onClick={() => navigate(`/student/course-details/questions/${question.slotId}-${q.id}`)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${question.id === q.id.toString()
                                        ? 'bg-orange-50 text-[#F37022] font-medium'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-[#F37022]'
                                        }`}
                                >
                                    <FileText className="w-4 h-4 flex-shrink-0" />
                                    <span className="flex-1 truncate">{q.title}</span>
                                    {q.status === 'finished' && (
                                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuestionDetail;
