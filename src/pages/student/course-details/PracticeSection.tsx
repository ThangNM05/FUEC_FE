import { useState, useMemo } from 'react';
import { BookOpen, Play, HelpCircle, LayoutList, Sparkles } from 'lucide-react';
import { useGetQuestionsQuery } from '@/api/questionsApi';
import { useNavigate } from 'react-router-dom';

interface PracticeSectionProps {
    classSubjectId: string;
    subjectCode: string;
    subjectId: string;
}

export default function PracticeSection({ classSubjectId, subjectCode, subjectId }: PracticeSectionProps) {
    const navigate = useNavigate();
    const { data: questionsData, isLoading } = useGetQuestionsQuery({
        subjectId,
        pageSize: 200, // Fetch a large enough pool for practice
    });

    const questions = questionsData?.items || [];

    // Divide into 5 parts
    const parts = useMemo(() => {
        if (questions.length === 0) return [];

        const countPerPart = Math.ceil(questions.length / 5);
        return Array.from({ length: 5 }, (_, i) => {
            const start = i * countPerPart;
            const end = Math.min(start + countPerPart, questions.length);
            const partQuestions = questions.slice(start, end);

            return {
                id: i + 1,
                title: `Self-study Part ${i + 1}`,
                description: `Revision covering ${partQuestions.length} questions from the bank.`,
                questionCount: partQuestions.length,
                questions: partQuestions
            };
        }).filter(p => p.questionCount > 0);
    }, [questions]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-[#F37022] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500 font-medium italic">Scanning question bank...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="p-12 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <HelpCircle className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-[#0A1B3C] mb-2">No Question Bank Found</h3>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                    This subject does not have enough questions in the bank for self-study tests yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section - Modern Lighter Look */}
            <div className="bg-[#FFF8F4] border border-[#FFE7D9] p-8 rounded-3xl relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-40 h-40 bg-[#F37022]/5 rounded-full blur-3xl transition-all group-hover:bg-[#F37022]/10" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#F37022] rounded-2xl flex items-center justify-center shadow-xl shadow-orange-100 transform transition-transform group-hover:scale-105">
                            <LayoutList className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-3 h-3 text-[#F37022]" />
                                <span className="text-[9px] font-black text-[#F37022] uppercase tracking-[0.2em]">Practice Mode</span>
                            </div>
                            <h2 className="text-xl font-black text-[#0A1B3C] leading-none">Subject Practice Bank</h2>
                            <p className="text-gray-500 text-xs mt-2 font-medium">Review <span className="text-[#F37022] font-semibold">{questions.length} questions</span> available in your subject materials.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parts Grid */}
            <div className="grid grid-cols-1 gap-4">
                {parts.map((part) => (
                    <div
                        key={part.id}
                        className="flex items-center justify-between p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#FFE7D9] hover:bg-[#FFFDFB] hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#FFF8F4] border border-[#FFE7D9] flex items-center justify-center transition-all group-hover:bg-[#F37022] group-hover:border-[#F37022]">
                                <span className="text-lg font-bold text-[#F37022] group-hover:text-white transition-colors">{part.id}</span>
                            </div>
                            <div>
                                <h4 className="text-base font-bold text-[#0A1B3C] group-hover:text-[#F37022] transition-colors leading-tight">
                                    {part.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-1 h-1 rounded-full bg-gray-300" />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{part.questionCount} Questions</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                navigate(`/student/practice-runner/${classSubjectId}?part=${part.id}&subjectId=${subjectId}`);
                            }}
                            className="bg-white hover:bg-[#F37022] text-[#F37022] hover:text-white border-1.5 border-[#F37022]/40 hover:border-[#F37022] px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 active:scale-95 shadow-sm hover:shadow-lg hover:shadow-orange-100"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Begin Revise
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
                <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Study Tip</p>
                    <p className="opacity-80">These tests are for self-study and do not affect your formal grades. You can retake them as many times as you like to master the content.</p>
                </div>
            </div>
        </div>
    );
}
