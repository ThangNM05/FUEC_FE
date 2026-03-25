import { useState } from 'react';
import { toast } from 'sonner';
import { Modal, Select, Button, Alert } from 'antd';
import { Settings2 } from 'lucide-react';
import { useGetSemestersQuery, useSetDefaultSemesterMutation } from '@/api/semestersApi';

interface SetDefaultSemesterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SetDefaultSemesterModal({ isOpen, onClose }: SetDefaultSemesterModalProps) {
    const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');
    const { data: semestersData, isLoading: isLoadingSemesters } = useGetSemestersQuery({ page: 1, pageSize: 100 });
    const [setDefaultSemester, { isLoading: isSettingDefault }] = useSetDefaultSemesterMutation();

    const semesters = semestersData?.items || [];

    const handleSubmit = async () => {
        if (!selectedSemesterId) {
            toast.error('Please select a semester');
            return;
        }

        const semester = semesters.find(s => s.id === selectedSemesterId);
        if (!semester) return;

        try {
            await setDefaultSemester(selectedSemesterId).unwrap();
            toast.success(`Semester ${semester.semesterCode} is now set as the global default.`);
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to set default semester');
        }
    };

    const defaultSemester = semesters.find(s => s.isDefault);

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-[#F37022]" />
                    <span>Set System Default Semester</span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            width={500}
            styles={{ 
                header: { padding: '16px 16px 0 16px' },
                body: { padding: '16px' }, 
                footer: { padding: '16px' } 
            }}
            footer={[
                <Button key="cancel" onClick={onClose} disabled={isSettingDefault} size="large">
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isSettingDefault}
                    onClick={handleSubmit}
                    className="bg-[#F37022] hover:bg-[#d95f19] border-none"
                    disabled={!selectedSemesterId}
                    size="large"
                >
                    Confirm & Set Default
                </Button>
            ]}
        >
            <div className="flex flex-col gap-2">
                <Alert
                    message="Critical Operation"
                    description="Setting a new default semester will affect all users (Admins, Instructors, and Students). Demos and dashboard data will be scope to this semester by default."
                    type="warning"
                    showIcon
                />

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-[#0A1B3C]">
                        Select Semester
                    </label>
                    <Select
                        size="large"
                        placeholder={defaultSemester ? `Current: ${defaultSemester.semesterCode}` : "Choose a semester to set as global default"}
                        className="w-full"
                        onChange={setSelectedSemesterId}
                        loading={isLoadingSemesters}
                        options={semesters.map(s => ({
                            label: `${s.semesterCode}${s.isDefault ? ' (Current Default)' : ''}`,
                            value: s.id,
                            disabled: s.isDefault
                        }))}
                    />
                </div>
            </div>
        </Modal>
    );
}
