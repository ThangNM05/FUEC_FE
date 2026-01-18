import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';

interface ImportResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: any; // Allow relaxed types to handle casing structure
}

export default function ImportResultModal({ isOpen, onClose, result }: ImportResultModalProps) {
    if (!isOpen || !result) return null;

    // Normalize data (handle potential PascalCase from .NET)
    const successCount = result.successCount ?? result.SuccessCount ?? 0;
    const failureCount = result.failureCount ?? result.FailureCount ?? 0;
    const errors = result.errors ?? result.Errors ?? [];

    const hasFailures = failureCount > 0 || errors.length > 0;
    // Critical error: No processing happened (0 success, 0 failed) but we have errors (e.g. invalid file format)
    const isCriticalError = errors.length > 0 && successCount === 0 && failureCount === 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between bg-white">
                    <h3 className={`font-semibold text-lg ${hasFailures ? 'text-red-600' : 'text-green-600'}`}>
                        {isCriticalError ? 'Import Error' : (hasFailures ? 'Import Result (With Errors)' : 'Import Successful')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {!hasFailures ? (
                        // Success State
                        <div className="flex flex-col items-center justify-center py-4 text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900">Completed!</h4>
                                <p className="text-gray-600 mt-1">Successfully added <strong className="text-green-600">{successCount}</strong> students.</p>
                            </div>
                        </div>
                    ) : isCriticalError ? (
                        // Critical Error State (No stats, just error)
                        <div className="flex flex-col items-center justify-center py-2 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                                <X className="w-10 h-10 text-red-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-gray-900 mb-2">Import Failed</h4>
                                <div className="bg-red-50 p-4 rounded-lg border border-red-100 text-left">
                                    <ul className="text-sm text-red-600 space-y-1">

                                    </ul>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Mixed/Error State
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center text-center">
                                    <div className="mb-2 p-2 bg-green-100 rounded-full">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                    </div>
                                    <span className="text-2xl font-bold text-green-700">{successCount}</span>
                                    <span className="text-xs font-medium text-green-600 uppercase tracking-wide">Success</span>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col items-center text-center">
                                    <div className="mb-2 p-2 bg-red-100 rounded-full">
                                        <AlertTriangle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <span className="text-2xl font-bold text-red-700">{failureCount}</span>
                                    <span className="text-xs font-medium text-red-600 uppercase tracking-wide">Failed</span>
                                </div>
                            </div>

                            {/* Error List */}
                            <div className="border border-red-200 rounded-lg overflow-hidden">
                                <div className="bg-red-50 px-4 py-2 border-b border-red-200 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="font-semibold text-red-800 text-sm">Error Details ({errors.length})</span>
                                </div>
                                <div className="max-h-[200px] overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                    {errors.length > 0 ? (
                                        <ul className="divide-y divide-gray-100">
                                            {errors.map((error: string, index: number) => (
                                                <li key={index} className="px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-start">
                                                    <span className="text-red-500 font-mono mr-2 shrink-0">[{index + 1}]</span>
                                                    <span className="break-words">{error}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="p-8 text-center text-gray-400 text-sm italic">
                                            No specific error details.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all ${!hasFailures
                            ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {hasFailures ? 'Close' : 'Finish'}
                    </button>
                </div>
            </div>
        </div>
    );
}
