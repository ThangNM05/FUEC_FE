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
                    <p className="text-gray-600 font-medium tracking-wide">Đang tải kết quả bài làm...</p>
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
                    <h2 className="text-2xl font-black text-[#0A1B3C] mb-3">Không tìm thấy bài làm</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">Bộ dữ liệu bài làm này không tồn tại hoặc đã bị gỡ bỏ khỏi hệ thống.</p>
                    <button
                        onClick={() => window.close()}
                        className="w-full py-4 bg-[#F37022] text-white rounded-xl font-bold hover:bg-[#D96419] transition-all shadow-lg shadow-orange-100"
                    >
                        Đóng cửa sổ
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
                                <h1 className="text-3xl font-black text-[#0A1B3C] leading-none mb-3">Kết quả chi tiết</h1>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-black rounded-lg uppercase tracking-wider">
                                        Sinh viên: {examData.studentName} ({examData.studentCode})
                                    </span>
                                    <span className="px-3 py-1.5 bg-[#F37022]/10 text-[#F37022] text-xs font-black rounded-lg uppercase tracking-wider">
                                        {examData.examDisplayName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-12 bg-gray-50/80 px-10 py-6 rounded-3xl border border-gray-100">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Điểm số</p>
                                <p className={`text-4xl font-black ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                    {grade.toFixed(1)}
                                </p>
                                <p className="text-[10px] font-bold text-gray-400">trên 10.0</p>
                            </div>
                            <div className="w-px h-12 bg-gray-200" />
                            <div className="text-center">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kết quả</p>
                                <div className={`flex items-center justify-center gap-1.5 font-black text-sm ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                    {passed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                    {passed ? 'ĐẠT' : 'KHÔNG ĐẠT'}
                                </div>
                                <p className="text-[10px] font-bold text-gray-400">Final Status</p>
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
                    className="flex items-center gap-2.5 px-6 py-3.5 bg-white text-gray-500 hover:text-[#0A1B3C] hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all rounded-2xl border border-gray-100 font-black text-xs tracking-widest uppercase group shadow-lg"
                >
                    <ArrowLeft className="w-4 h-4 text-[#F37022] transition-transform group-hover:-translate-x-1" />
                    Quay lại
                </button>
            </div>
        </div>
    );
};

export default TeacherExamReview;
