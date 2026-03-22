import { Modal, Button } from 'antd';
import Lottie from 'lottie-react';
import errorAnimation from '@/assets/lottie/error.json';

interface ConfirmDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string; // Keep for now to avoid breaking existing callers, but remove from UI
    confirmButtonLabel?: string;
    confirmButtonVariant?: 'danger' | 'success';
}

function ConfirmDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure you want to delete this item?',
    message = 'This action cannot be undone. This will permanently delete the item from the system.',
    itemName,
    confirmButtonLabel = 'Delete',
    confirmButtonVariant = 'danger'
}: ConfirmDeleteModalProps) {
    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            closable={false}
            width={500}
            centered
            className="confirm-delete-modal"
        >
            <div className="py-6 px-4">
                {/* Lottie Animation */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24">
                        <Lottie
                            animationData={errorAnimation}
                            loop={true}
                        />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-[#0A1B3C] text-center mb-4 leading-tight">
                    {title}
                </h2>

                {/* Message */}
                <div className="text-center mb-8">
                    <p className="text-gray-500 text-lg leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        onClick={onClose}
                        size="large"
                        className="flex-1 h-12 rounded-xl border-2 border-gray-100 font-bold text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all"
                    >
                        Keep It
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        size="large"
                        type="primary"
                        className={`flex-1 h-12 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] border-none ${confirmButtonVariant === 'danger'
                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                            : 'bg-green-500 hover:bg-green-600 shadow-green-200'
                            }`}
                    >
                        {confirmButtonLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default ConfirmDeleteModal;
