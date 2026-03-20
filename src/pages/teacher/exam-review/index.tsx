import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { useGetStudentExamByIdQuery } from '@/api/studentExamsApi';
import { Loader2, ArrowLeft, GraduationCap, CheckCircle, Clock } from 'lucide-react';
import ExamReviewList from '@/components/quiz/ExamReviewList';

const TeacherExamReview: React.FC = () => {
    const { studentExamId } = useParams<{ studentExamId: string }>();
    const navigate = useNavigate();

    const { data: examData, isLoading, error } = useGetStudentExamByIdQuery(
        studentExamId || '',
        { skip: !studentExamId }
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#F37022] mx-auto mb-4" />
                    <p className="text-gray-600 font-medium tracking-wide">Loading exam results...</p>
                </div>
            </div>
        );
    }

    if (error || !examData) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center bg-white p-12 rounded-3xl border border-gray-100 shadow-xl max-w-lg mx-4">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <GraduationCap className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0A1B3C] mb-3">Exam result not found</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">This exam result does not exist or has been removed from the system.</p>
                    <button
                        onClick={() => window.close()}
                        className="w-full py-4 bg-[#F37022] text-white rounded-xl font-bold hover:bg-[#D96419] transition-all shadow-lg shadow-orange-100"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        );
    }

    const grade = examData.grade ?? 0;
    const passed = grade >= 5;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header / Summary Section */}
            <div className="bg-white border-b border-gray-100 relative">
                <div className="max-w-7xl mx-auto px-4 py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner ${passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                <GraduationCap className="w-12 h-12" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-[#0A1B3C] leading-none mb-3">Detailed Result</h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg uppercase tracking-wider">
                                        Student: {examData.studentName} ({examData.studentCode})
                                    </span>
                                    <span className="px-3 py-1.5 bg-[#F37022]/10 text-[#F37022] text-xs font-semibold rounded-lg uppercase tracking-wider">
                                        {examData.examDisplayName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2rem] border-2 border-amber-100 bg-amber-50/50 transition-all shadow-lg shadow-amber-900/5 relative overflow-hidden group/score">
                            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover/score:scale-110 transition-transform duration-500">
                                <GraduationCap className="w-32 h-32" />
                            </div>

                            <div className="flex flex-col items-center md:items-start relative z-10">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2 text-amber-600">
                                    Student Performance
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-6xl font-black tracking-tighter leading-none text-amber-700">
                                        {grade.toFixed(1)}
                                    </span>
                                    <span className="text-2xl font-bold text-gray-400">/ 10.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Detailed Questions */}
            <div className="mt-8 px-4">
                <ExamReviewList questions={examData.questions || []} />
            </div>

            {/* Fixed Back Action */}
            <div className="fixed top-24 left-10 z-[60]">
                <button
                    onClick={() => window.close()}
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-gray-500 hover:text-[#0A1B3C] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all rounded-2xl border border-gray-100 font-bold text-xs tracking-widest uppercase group shadow-lg"
                >
                    <ArrowLeft className="w-4 h-4 text-[#F37022] transition-transform group-hover:-translate-x-1" />
                    Back
                </button>
            </div>
        </div>
    );
};

export default TeacherExamReview;
