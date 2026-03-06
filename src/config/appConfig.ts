/**
 * Centralized Application Configuration
 * Manages all app settings based on environment
 */

const env = import.meta.env.MODE || 'development';

interface ApiConfig {
    baseURL: string;
    timeout: number;
}

interface AppInfo {
    name: string;
    version: string;
    environment: string;
}

interface UploadConfig {
    maxFileSizeMB: number;
    allowedExtensions: string[];
    allowedMimeTypes: string[];
}

interface PaginationConfig {
    defaultPageSize: number;
    pageSizeOptions: number[];
}

interface AppConfiguration {
    api: ApiConfig;
    app: AppInfo;
    upload: UploadConfig;
    pagination: PaginationConfig;
}

const configs: Record<string, AppConfiguration> = {
    development: {
        api: {
            baseURL: import.meta.env.VITE_API_URL,
            timeout: 30000, // 30 seconds
        },
        app: {
            name: 'FUEC System',
            version: '1.0.0',
            environment: 'Development',
        },
        upload: {
            maxFileSizeMB: 10,
            allowedExtensions: ['.xlsx', '.xls'],
            allowedMimeTypes: [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ],
        },
        pagination: {
            defaultPageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
        },
    },
    production: {
        api: {
            baseURL: import.meta.env.VITE_API_URL,
            timeout: 30000,
        },
        app: {
            name: 'FUEC System',
            version: '1.0.0',
            environment: 'Production',
        },
        upload: {
            maxFileSizeMB: 10,
            allowedExtensions: ['.xlsx', '.xls'],
            allowedMimeTypes: [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel',
            ],
        },
        pagination: {
            defaultPageSize: 20,
            pageSizeOptions: [10, 20, 50, 100],
        },
    },
};

// Export config based on environment
export const AppConfig = configs[env];

/**
 * Helper: Build full API URL from endpoint
 * @param endpoint - API endpoint (can start with or without /)
 */
export const getApiUrl = (endpoint: string): string => {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${AppConfig.api.baseURL}${normalizedEndpoint}`;
};

/**
 * Helper: Validate file for upload
 * @param file - File to validate
 * @returns Validation result with errors if any
 */
export const validateFileUpload = (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check file size
    const maxSizeBytes = AppConfig.upload.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        errors.push(`File quá lớn. Tối đa ${AppConfig.upload.maxFileSizeMB}MB`);
    }

    // Check extension
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!AppConfig.upload.allowedExtensions.includes(extension)) {
        errors.push(`Chỉ chấp nhận file: ${AppConfig.upload.allowedExtensions.join(', ')}`);
    }

    // Check MIME type
    if (!AppConfig.upload.allowedMimeTypes.includes(file.type)) {
        errors.push('Định dạng file không được hỗ trợ');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Helper: Format file size to readable string
 * @param bytes - File size in bytes
 */
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export default AppConfig;
