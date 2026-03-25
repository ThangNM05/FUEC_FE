import { useState } from 'react';
import { Modal, Checkbox, Button, List, Spin, Alert, Empty } from 'antd';
import { Copy, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAuthTeacherTeachingSubjectsQuery } from '@/api/teachersApi';
import { useCloneConfigMutation, useGetStudentClassesByClassIdQuery } from '@/api/classDetailsApi';

interface CloneConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    sourceClassSubjectId: string;
    subjectId: string;
    courseCode: string;
    courseName?: string;
}

function TargetClassItem({ cls, isChecked, onChange }: { cls: any, isChecked: boolean, onChange: (checked: boolean) => void }) {
    const { data: studentsData } = useGetStudentClassesByClassIdQuery(
        { classSubjectId: cls.classSubjectId, pageSize: 1 },
        { skip: !cls.classSubjectId }
    );
    const realStudentCount = studentsData?.totalItemCount ?? cls.studentCount;

    return (
        <div className="px-5 py-4 hover:bg-gray-50 transition-colors border-b last:border-b-0 border-gray-100">
            <div className="flex items-center gap-4 w-full">
                <Checkbox
                    checked={isChecked}
                    onChange={e => onChange(e.target.checked)}
                    className="flex-shrink-0"
                />
                <div 
                    className="flex flex-col flex-1 cursor-pointer select-none" 
                    onClick={() => onChange(!isChecked)}
                >
                    <span className="text-sm font-bold text-[#0A1B3C] mb-0.5">{cls.classCode}</span>
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                            {cls.semesterCode}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span>{realStudentCount} {realStudentCount > 1 ? 'students' : 'student'}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function CloneConfigModal({
    isOpen,
    onClose,
    sourceClassSubjectId,
    subjectId,
    courseCode,
    courseName
}: CloneConfigModalProps) {
    const [targetClassSubjectIds, setTargetClassSubjectIds] = useState<string[]>([]);
    const [cloneMaterials, setCloneMaterials] = useState(true);
    const [cloneAssignments, setCloneAssignments] = useState(true);
    const [cloneExams, setCloneExams] = useState(true);

    const { data: teachingData, isLoading: isLoadingTeaching } = useGetAuthTeacherTeachingSubjectsQuery({});
    const [cloneConfig, { isLoading: isCloning }] = useCloneConfigMutation();

    // Filter classes with the same subjectId but different classSubjectId
    const targetClasses = (teachingData?.subjects || [])
        .filter(s => s.subjectId === subjectId)
        .flatMap(s => s.classes)
        .filter(c => c.classSubjectId !== sourceClassSubjectId);

    const handleClone = async () => {
        if (targetClassSubjectIds.length === 0) {
            toast.error('Please select at least one target class');
            return;
        }

        try {
            const result = await cloneConfig({
                sourceClassSubjectId,
                targetClassSubjectIds,
                cloneMaterials,
                cloneAssignments,
                cloneExams
            }).unwrap();

            if (result.success) {
                toast.success(result.message || 'Configuration cloned successfully!');
                onClose();
            } else {
                toast.error(result.message || 'Failed to clone configuration');
            }
        } catch (err: any) {
            console.error('Clone Error:', err);
            const errorMessage = err?.data?.message || err?.message || 'An unexpected error occurred during cloning.';
            toast.error(errorMessage);
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-[#0A1B3C]">
                    <Copy className="w-5 h-5 text-[#F37022]" />
                    <span>Clone Configuration</span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            width={550}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={isCloning}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isCloning}
                    onClick={handleClone}
                    className="bg-[#F37022] hover:bg-[#d95f19] border-none"
                    disabled={targetClassSubjectIds.length === 0 || (!cloneMaterials && !cloneAssignments && !cloneExams)}
                >
                    Clone to Selected Classes
                </Button>
            ]}
        >
            <div className="flex flex-col gap-6 py-2">
                {/* Header Info */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Source Class</p>
                    <p className="text-sm font-bold text-[#0A1B3C]">{courseCode} - {courseName}</p>
                </div>

                {/* Options */}
                <div>
                    <h4 className="text-sm font-semibold text-[#0A1B3C] mb-3">Clone Options</h4>
                    <div className="flex flex-wrap gap-4">
                        <Checkbox checked={cloneMaterials} onChange={e => setCloneMaterials(e.target.checked)}>
                            Learning Materials
                        </Checkbox>
                        <Checkbox checked={cloneAssignments} onChange={e => setCloneAssignments(e.target.checked)}>
                            Assignments
                        </Checkbox>
                        <Checkbox checked={cloneExams} onChange={e => setCloneExams(e.target.checked)}>
                            Progress Tests
                        </Checkbox>
                    </div>
                </div>

                {/* Target Classes */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-[#0A1B3C]">Select Target Classes</h4>
                        <span className="text-xs text-gray-500">{targetClasses.length} available</span>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto scrollbar-thin">
                        <Spin spinning={isLoadingTeaching}>
                            {targetClasses.length > 0 ? (
                                <List
                                    dataSource={targetClasses}
                                    renderItem={cls => (
                                        <TargetClassItem 
                                            cls={cls}
                                            isChecked={targetClassSubjectIds.includes(cls.classSubjectId)}
                                            onChange={(checked) => {
                                                if (checked) {
                                                    setTargetClassSubjectIds([...targetClassSubjectIds, cls.classSubjectId]);
                                                } else {
                                                    setTargetClassSubjectIds(targetClassSubjectIds.filter(id => id !== cls.classSubjectId));
                                                }
                                            }}
                                        />
                                    )}
                                />
                            ) : (
                                <div className="py-10 text-center">
                                    <Empty description="No other classes found for this subject" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                </div>
                            )}
                        </Spin>
                    </div>
                </div>

                <Alert
                    message="Configuration Override"
                    description="Cloning will add these items to the target classes. If an item with the same name exists, it may create a duplicate."
                    type="info"
                    showIcon
                    icon={<AlertCircle className="w-4 h-4" />}
                />
            </div>
        </Modal>
    );
}
