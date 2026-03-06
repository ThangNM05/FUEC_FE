import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, FileSpreadsheet, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import type { ImportPreviewQuestion } from '@/api/questionsApi';

interface ImportPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    previewData: {
        subjectCode: string;
        questions: ImportPreviewQuestion[];
        duplicateCount: number;
        errors: string[];
    } | null;
    onConfirm: (selectedQuestions: ImportPreviewQuestion[]) => Promise<void>;
    isImporting: boolean;
}

export default function ImportPreviewModal({
    isOpen,
    onClose,
    previewData,
    onConfirm,
    isImporting
}: ImportPreviewModalProps) {
    const [checkedSet, setCheckedSet] = useState<Set<number>>(() => new Set());

    // When previewData changes (new file loaded), reset selection to all non-duplicates
    const allNewIndices = useMemo(() => {
        if (!previewData) return new Set<number>();
        const s = new Set<number>();
        previewData.questions.forEach((q, i) => { if (!q.isDuplicate) s.add(i); });
        return s;
    }, [previewData]);

    // Use allNewIndices as default checked (derived state initializer pattern)
    const [prevCode, setPrevCode] = useState<string>('');
    if (previewData && previewData.subjectCode !== prevCode) {
        setPrevCode(previewData.subjectCode);
        setCheckedSet(new Set(allNewIndices));
    }

    if (!isOpen || !previewData) return null;

    const { questions, duplicateCount, errors } = previewData;
    const total = questions.length;
    const selectedCount = checkedSet.size;

    const toggle = (i: number) => {
        if (questions[i].isDuplicate) return;
        setCheckedSet(prev => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });
    };

    const toggleAll = () => {
        if (checkedSet.size === allNewIndices.size) {
            setCheckedSet(new Set());
        } else {
            setCheckedSet(new Set(allNewIndices));
        }
    };

    const handleConfirm = async () => {
        const selected = questions.filter((_, i) => checkedSet.has(i));
        await onConfirm(selected);
    };

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <FileSpreadsheet className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[#0A1B3C]">Import Preview</h2>
                            <p className="text-sm text-gray-500">
                                {total} questions parsed · {duplicateCount} duplicate{duplicateCount !== 1 ? 's' : ''} · {selectedCount} selected
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <div className="text-sm text-red-700">
                            {errors.map((e, i) => <p key={i}>{e}</p>)}
                        </div>
                    </div>
                )}

                {/* Legend + Select All */}
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> New question
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Already exists (duplicate)
                        </span>
                    </div>
                    {allNewIndices.size > 0 && (
                        <button onClick={toggleAll} className="text-xs text-orange-600 hover:text-orange-700 font-medium">
                            {checkedSet.size === allNewIndices.size ? 'Deselect all' : 'Select all new'}
                        </button>
                    )}
                </div>

                {/* Question List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                    {questions.map((q, i) => {
                        const isDup = q.isDuplicate;
                        const isChecked = checkedSet.has(i);
                        return (
                            <div
                                key={i}
                                onClick={() => toggle(i)}
                                className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${isDup
                                    ? 'bg-red-50 cursor-not-allowed'
                                    : 'hover:bg-orange-50/50 cursor-pointer'
                                    }`}
                            >
                                {/* Checkbox */}
                                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isDup
                                    ? 'border-red-300 bg-red-100'
                                    : isChecked
                                        ? 'border-orange-500 bg-orange-500'
                                        : 'border-gray-300 bg-white'
                                    }`}>
                                    {isChecked && !isDup && (
                                        <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                                    )}
                                    {isDup && (
                                        <X className="w-3 h-3 text-red-400" strokeWidth={3} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium leading-snug ${isDup ? 'text-red-600' : 'text-[#0A1B3C]'}`}>
                                        {q.questionContent}
                                        {isDup && <span className="ml-2 text-xs font-normal text-red-400 italic">(duplicate)</span>}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                                        {q.options.map((opt, oi) => (
                                            <span
                                                key={oi}
                                                className={`px-1.5 py-0.5 rounded text-xs ${opt.isCorrect
                                                    ? isDup ? 'bg-red-100 text-red-600 font-semibold' : 'bg-green-100 text-green-700 font-semibold'
                                                    : isDup ? 'bg-red-50 text-red-400' : 'bg-gray-100 text-gray-500'
                                                    }`}
                                            >
                                                {opt.choiceContent}
                                                {opt.isCorrect && ' ✓'}
                                            </span>
                                        ))}
                                    </div>
                                    {q.tag && (
                                        <span className={`mt-1 inline-block text-xs px-1.5 py-0.5 rounded ${isDup ? 'bg-red-100 text-red-400' : 'bg-orange-100 text-orange-600'}`}>
                                            {q.tag}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-white">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedCount === 0 || isImporting}
                        className="flex items-center gap-2 px-5 py-2 bg-[#F37022] text-white rounded-lg text-sm font-medium hover:bg-[#d95f19] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200"
                    >
                        {isImporting
                            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Upload className="w-4 h-4" />}
                        {isImporting ? 'Importing...' : `Import ${selectedCount} question${selectedCount !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
