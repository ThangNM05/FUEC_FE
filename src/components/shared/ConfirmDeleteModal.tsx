import { X } from 'lucide-react';
import Lottie from 'lottie-react';
import errorAnimation from '@/assets/lottie/error.json';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
}

function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure you want to delete this item?',
    message = 'This action cannot be undone. This will permanently delete the item from the system.',
    itemName
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Lottie Animation */}
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20">
                        <Lottie
                            animationData={errorAnimation}
                            loop={true}
                        />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-base font-bold text-gray-900 text-center mb-2">
                    {title}
                </h2>

                {/* Message */}
                <p className="text-sm text-gray-600 text-center mb-6">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors text-sm font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDeleteModal;
