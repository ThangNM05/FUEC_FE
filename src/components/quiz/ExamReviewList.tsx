import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import type { ExamQuestion } from '@/types/exam.types';

interface ExamReviewListProps {
    questions: any[]; // Extended QuestionDto with choiceId
}

const ExamReviewList: React.FC<ExamReviewListProps> = ({ questions }) => {
    if (!questions || questions.length === 0) return null;

    return (
        <div className="space-y-8 mt-12 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#0A1B3C] border-b pb-4 flex items-center gap-3">
                <div className="w-2 h-8 bg-[#F37022] rounded-full" />
                Exam Details
            </h2>
            
            {questions.map((q, index) => {
                const studentChoiceIds = q.choiceIds || (q.choiceId ? [q.choiceId] : []);
                const correctOptions = q.options?.filter((o: any) => o.isCorrect) || [];
                const correctOptionIds = correctOptions.map((o: any) => o.id);
                
                const isAnswered = studentChoiceIds.length > 0;
                const isCorrect = isAnswered && 
                    studentChoiceIds.length === correctOptionIds.length && 
                    studentChoiceIds.every((id: string) => correctOptionIds.includes(id));

                return (
                    <div key={q.id || index} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                                    Question {index + 1}
                                </span>
                                {isAnswered ? (
                                    isCorrect ? (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                                            <Check className="w-3.5 h-3.5" /> Correct
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-red-600">
                                            <X className="w-3.5 h-3.5" /> Incorrect
                                        </span>
                                    )
                                ) : (
                                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-400">
                                        <AlertCircle className="w-3.5 h-3.5" /> Unanswered
                                    </span>
                                )}
                            </div>
                        </div>

                        <h3 className="text-lg font-bold text-[#0A1B3C] mb-6 leading-relaxed">
                            {q.questionContent}
                        </h3>

                        <div className="space-y-3">
                            {q.options?.map((option: any, oIdx: number) => {
                                const isSelected = studentChoiceIds.includes(option.id);
                                const isCorrectOption = option.isCorrect;
                                
                                let borderClass = 'border-gray-100';
                                let bgClass = 'bg-white';
                                let textClass = 'text-[#0A1B3C]';
                                let icon = null;

                                if (isSelected) {
                                    if (isCorrectOption) {
                                        borderClass = 'border-green-500 bg-green-50/50';
                                        icon = <Check className="w-4 h-4 text-green-600" />;
                                    } else {
                                        borderClass = 'border-red-500 bg-red-50/50';
                                        icon = <X className="w-4 h-4 text-red-600" />;
                                    }
                                } else if (isCorrectOption && isAnswered) {
                                    // Highlight the correct answer if student chose wrong
                                    borderClass = 'border-green-200 bg-green-50/30';
                                    icon = <Check className="w-4 h-4 text-green-400" />;
                                }

                                const isMulti = correctOptionIds.length > 1;

                                return (
                                    <div
                                        key={option.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${borderClass} ${bgClass}`}
                                    >
                                        <div className={`w-6 h-6 ${isMulti ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center flex-shrink-0 ${
                                            isSelected ? (isCorrectOption ? 'border-green-500 bg-green-500' : 'border-red-500 bg-red-500') : 'border-gray-200'
                                        }`}>
                                            {isSelected && <div className={`w-2 h-2 ${isMulti ? 'rounded-sm' : 'rounded-full'} bg-white`} />}
                                        </div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <span className={`text-sm font-semibold ${textClass} flex items-start gap-2`}>
                                                <span className="text-gray-400">{String.fromCharCode(65 + oIdx)}.</span>
                                                {option.choiceContent}
                                            </span>
                                            {icon}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ExamReviewList;
