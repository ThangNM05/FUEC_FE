import { toast as sonnerToast } from 'sonner';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { createElement } from 'react';

/**
 * Toast notification utilities using Sonner
 * Provides consistent toast notifications across the app
 */

interface ToastOptions {
    duration?: number;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
}

const defaultOptions: ToastOptions = {
    duration: 4000,
};

export const toast = {
    /**
     * Show success toast
     * @example toast.success('Đặt dạt lên hiệu vời thành công!')
     */
    success: (message: string, options?: ToastOptions) => {
        sonnerToast.success(message, {
            ...defaultOptions,
            ...options,
            icon: createElement(CheckCircle, { className: 'w-5 h-5 text-green-700' }),
            classNames: {
                toast: 'bg-green-50 border-green-200',
                title: 'text-green-800',
                description: 'text-green-700',
            },
            style: {
                background: '#f0fdf4',
                borderColor: '#bbf7d0',
                color: '#166534',
            },
        });
    },

    /**
     * Show error toast
     * @example toast.error('Có lỗi xảy ra. Vui lòng thử lại!')
     */
    error: (message: string, options?: ToastOptions) => {
        sonnerToast.error(message, {
            ...defaultOptions,
            ...options,
            icon: createElement(XCircle, { className: 'w-5 h-5 text-red-700' }),
            classNames: {
                toast: 'bg-red-50 border-red-200',
                title: 'text-red-800',
                description: 'text-red-700',
            },
            style: {
                background: '#fef2f2',
                borderColor: '#fecaca',
                color: '#991b1b',
            },
        });
    },

    /**
     * Show warning toast
     * @example toast.warning('Vui lòng kiểm tra lại thông tin!')
     */
    warning: (message: string, options?: ToastOptions) => {
        sonnerToast.warning(message, {
            ...defaultOptions,
            ...options,
            icon: createElement(AlertCircle, { className: 'w-5 h-5 text-yellow-700' }),
            classNames: {
                toast: 'bg-yellow-50 border-yellow-200',
                title: 'text-yellow-800',
                description: 'text-yellow-700',
            },
            style: {
                background: '#fefce8',
                borderColor: '#fef08a',
                color: '#854d0e',
            },
        });
    },

    /**
     * Show info toast
     * @example toast.info('Thông tin đã được cập nhật')
     */
    info: (message: string, options?: ToastOptions) => {
        sonnerToast.info(message, {
            ...defaultOptions,
            ...options,
            icon: createElement(Info, { className: 'w-5 h-5 text-blue-700' }),
            classNames: {
                toast: 'bg-blue-50 border-blue-200',
                title: 'text-blue-800',
                description: 'text-blue-700',
            },
        });
    },

    /**
     * Show loading toast
     * @example const toastId = toast.loading('Đang xử lý...')
     * // Later: toast.dismiss(toastId)
     */
    loading: (message: string, options?: ToastOptions) => {
        return sonnerToast.loading(message, {
            ...defaultOptions,
            ...options,
        });
    },

    /**
     * Show promise toast (auto handles loading, success, error states)
     * @example 
     * toast.promise(
     *   saveData(),
     *   {
     *     loading: 'Đang lưu...',
     *     success: 'Lưu thành công!',
     *     error: 'Lưu thất bại!'
     *   }
     * )
     */
    promise: <T,>(
        promise: Promise<T>,
        messages: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        },
        options?: ToastOptions
    ) => {
        return sonnerToast.promise(promise, messages);
    },

    /**
     * Dismiss a specific toast or all toasts
     * @example toast.dismiss(toastId)
     * @example toast.dismiss() // dismiss all
     */
    dismiss: (toastId?: string | number) => {
        sonnerToast.dismiss(toastId);
    },
};

export default toast;
