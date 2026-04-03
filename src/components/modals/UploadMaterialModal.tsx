import React, { useState, useEffect } from 'react';
import { Modal, Checkbox, Button, List, Space, Alert } from 'antd';
import { useGetAuthTeacherTeachingSubjectsQuery } from '@/api/teachersApi';
import { useUploadCourseMaterialMutation } from '@/api/courseMaterialsApi';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface UploadMaterialModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string;
    currentClassSubjectId: string;
    subjectName: string;
    files: File[];
    onSuccess?: () => void;
}

const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
    isOpen,
    onClose,
    subjectId,
    currentClassSubjectId,
    subjectName,
    files,
    onSuccess,
}) => {
    const [selectedClassSubjectIds, setSelectedClassSubjectIds] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const { data: teachingData, isLoading: isLoadingClasses } = useGetAuthTeacherTeachingSubjectsQuery({});
    const [uploadMaterial] = useUploadCourseMaterialMutation();

    // Default to selecting the current class
    useEffect(() => {
        if (isOpen) {
            setSelectedClassSubjectIds([currentClassSubjectId]);
        }
    }, [isOpen, currentClassSubjectId]);

    // Find classes for the current subject
    const subjectClasses = teachingData?.subjects
        ?.find((s: any) => s.subjectId === subjectId || s.id === subjectId)
        ?.classes || [];

    const handleUpload = async () => {
        if (selectedClassSubjectIds.length === 0) {
            toast.error('Please select at least one class');
            return;
        }

        setIsUploading(true);
        try {
            for (const file of files) {
                const formData = new FormData();
                formData.append('File', file);
                
                // Backend expects multiple appends for the array of IDs (PascalCase)
                selectedClassSubjectIds.forEach(id => {
                    formData.append('ClassSubjectIds', id);
                });

                await uploadMaterial(formData).unwrap();
            }
            toast.success(`Uploaded ${files.length} material(s) successfully`);
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to upload materials');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal
            title="Upload Learning Material"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={isUploading}>
                    Cancel
                </Button>,
                <Button
                    key="upload"
                    type="primary"
                    onClick={handleUpload}
                    loading={isUploading}
                    className="bg-[#F37022] hover:bg-[#d95f19]"
                >
                    {isUploading ? 'Uploading...' : `Upload to ${selectedClassSubjectIds.length} class(es)`}
                </Button>,
            ]}
            width={500}
        >
            <div className="space-y-4 pt-2">
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Subject: {subjectName}</h3>
                    <Alert
                        message={`You are uploading ${files.length} file(s):`}
                        description={
                            <ul className="list-disc pl-5 mt-1 text-xs">
                                {files.map((f, i) => (
                                    <li key={i} className="truncate">{f.name}</li>
                                ))}
                            </ul>
                        }
                        type="info"
                        showIcon
                    />
                </div>

                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/30">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Select classes to upload:</h4>
                    {isLoadingClasses ? (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-[#F37022]" />
                        </div>
                    ) : (
                        <Checkbox.Group
                            className="w-full flex flex-col gap-3"
                            value={selectedClassSubjectIds}
                            onChange={(vals) => setSelectedClassSubjectIds(vals as string[])}
                        >
                            {subjectClasses.map((cls: any) => (
                                <div key={cls.classSubjectId} className="flex items-center justify-between group bg-white p-2 rounded border border-gray-100 hover:border-[#F37022]/30 transition-all">
                                    <Checkbox value={cls.classSubjectId}>
                                        <span className="text-sm font-medium text-[#0A1B3C]">
                                            {cls.classCode}
                                        </span>
                                    </Checkbox>
                                    <span className="text-[10px] text-gray-400 font-medium px-2 py-0.5 bg-gray-50 rounded uppercase">
                                        {cls.studentCount} students
                                    </span>
                                </div>
                            ))}
                        </Checkbox.Group>
                    )}
                </div>
                
                <p className="text-[11px] text-gray-400 italic text-center">
                    The materials will be available to all students in the selected classes.
                </p>
            </div>
        </Modal>
    );
};

export default UploadMaterialModal;
