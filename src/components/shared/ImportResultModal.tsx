import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { Modal, Button } from 'antd';

interface ImportResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: any; // Allow relaxed types to handle casing structure
    entityName?: string;
}

export default function ImportResultModal({ isOpen, onClose, result, entityName = 'items' }: ImportResultModalProps) {
    if (!isOpen || !result) return null;

    // Normalize data (handle potential PascalCase from .NET)
    const successCount = result.successCount ?? result.SuccessCount ?? 0;
    const failureCount = result.failureCount ?? result.FailureCount ?? 0;
    const errors = result.errors ?? result.Errors ?? [];
    const message = result.message ?? result.Message ?? null;

    // Treat 0 success as a failure if there are no other stats (empty import) or just general failure
    const hasFailures = failureCount > 0 || errors.length > 0 || successCount === 0;

    // Critical error: No processing happened (0 success, 0 failed) but we have errors OR just 0 success 0 failed (nothing imported)
    const isCriticalError = (errors.length > 0 && successCount === 0 && failureCount === 0) || (successCount === 0 && failureCount === 0);

    return (
        <Modal
            title={
                <span className={`text-lg font-bold ${hasFailures ? 'text-red-600' : 'text-green-600'}`}>
                    {isCriticalError ? 'Import Error' : (hasFailures ? 'Import Result (With Errors)' : 'Import Successful')}
                </span>
            }
            open={isOpen}
            onCancel={onClose}
            width={800}
            footer={[
                <Button
                    key="close"
                    size="large"
                    onClick={onClose}
                    type={!hasFailures ? 'primary' : 'default'}
                    className={!hasFailures ? 'bg-green-600 hover:bg-green-700 border-none' : ''}
                >
                    {hasFailures ? 'Close' : 'Finish'}
                </Button>
            ]}
        >
            <div className="py-6">
                {!hasFailures ? (
                    // Success State
                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle className="w-14 h-14 text-green-600" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-gray-900">Import Completed!</h4>
                            <p className="text-lg text-gray-600 mt-2">
                                Successfully processed <strong className="text-green-600 font-bold">{successCount}</strong> {entityName}.
                            </p>
                            {message && (
                                <p className="text-sm text-gray-500 mt-3 italic font-medium">"{message}"</p>
                            )}
                        </div>
                    </div>
                ) : isCriticalError ? (
                    // Critical Error State
                    <div className="flex flex-col items-center justify-center py-4 text-center space-y-6">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-12 h-12 text-red-600" />
                        </div>
                        <div className="w-full">
                            <h4 className="text-2xl font-bold text-gray-900 mb-4">Import Failed</h4>
                            <div className="bg-red-50 p-6 rounded-xl border border-red-200 text-left">
                                <ul className="text-base text-red-700 space-y-2">
                                    {errors.length > 0 ? (
                                        errors.map((err: string, idx: number) => (
                                            <li key={idx} className="flex gap-2">
                                                <span className="shrink-0">•</span>
                                                <span>{err}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li>No data was imported. Please verify that the file is not empty and follows the template.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Mixed State
                    <div className="space-y-8">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-green-50 border-2 border-green-100 rounded-2xl p-6 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-green-300">
                                <div className="mb-3 p-3 bg-green-100 rounded-full">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <span className="text-4xl font-black text-green-700">{successCount}</span>
                                <span className="text-sm font-bold text-green-600 uppercase tracking-widest mt-1">Succeeded</span>
                            </div>

                            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6 flex flex-col items-center text-center transition-all hover:shadow-md hover:border-red-300">
                                <div className="mb-3 p-3 bg-red-100 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-600" />
                                </div>
                                <span className="text-4xl font-black text-red-700">{failureCount}</span>
                                <span className="text-sm font-bold text-red-600 uppercase tracking-widest mt-1">Failed</span>
                            </div>
                        </div>

                        {/* Error List */}
                        <div className="border-2 border-red-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                            <div className="bg-red-50 px-6 py-4 border-b-2 border-red-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    <span className="font-bold text-red-800 text-lg">Error List</span>
                                </div>
                                <span className="bg-red-200 text-red-800 px-3 py-1 rounded-full text-sm font-bold">
                                    {errors.length} Errors
                                </span>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-200 scrollbar-track-transparent">
                                {errors.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {errors.map((error: string, index: number) => (
                                            <div key={index} className="px-6 py-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                                                <div className="shrink-0 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 font-mono text-xs font-bold border border-red-100">
                                                    {index + 1}
                                                </div>
                                                <div className="text-base text-gray-700 font-medium pt-1 break-words">
                                                    {error}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-gray-400 italic font-medium">
                                        No specific error details available.
                                    </div>
                                )}
                            </div>
                        </div>

                        {message && (
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mt-6">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Server Message</span>
                                <p className="text-gray-700 italic">"{message}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
