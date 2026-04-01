import { useState, useEffect } from 'react';
import { Modal, Button, Input, InputNumber } from 'antd';
import { toast } from 'sonner';
import { useCloneCurriculumMutation } from '@/api/curriculumsApi';
import type { Curriculum } from '@/types/curriculum.types';

interface CloneCurriculumModalProps {
    isOpen: boolean;
    onClose: () => void;
    curriculum: Curriculum | null;
}

function CloneCurriculumModal({ isOpen, onClose, curriculum }: CloneCurriculumModalProps) {
    const [code, setCode] = useState('');
    const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
    const [cohort, setCohort] = useState('');
    const [category, setCategory] = useState('');

    const [cloneCurriculum, { isLoading }] = useCloneCurriculumMutation();

    useEffect(() => {
        if (curriculum && isOpen) {
            setCode('');
            setStartYear(new Date().getFullYear());
            setCohort('');
            setCategory('');
        }
    }, [curriculum, isOpen]);

    const handleConfirm = async () => {
        if (!curriculum) return;

        if (!code.trim()) {
            toast.error('Please enter a curriculum code');
            return;
        }

        if (!startYear) {
            toast.error('Please enter a start year');
            return;
        }

        try {
            await cloneCurriculum({
                id: curriculum.id,
                code: code.trim(),
                startYear,
                cohort: cohort.trim() || undefined,
                category: category.trim() || undefined,
            }).unwrap();
            toast.success('Curriculum cloned successfully!');
            onClose();
        } catch (err) {
            toast.error('Failed to clone curriculum: ' + ((err as any)?.data?.message || (err as any)?.message || ''));
        }
    };

    return (
        <Modal
            title="Clone Curriculum"
            open={isOpen}
            onCancel={onClose}
            width={500}
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    onClick={handleConfirm}
                    className="bg-[#F37022] hover:bg-[#D96419] border-none"
                >
                    Clone
                </Button>,
            ]}
        >
            <div className="py-4 space-y-4">
                {curriculum && (
                    <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="text-gray-500">Cloning from:</p>
                        <p className="font-semibold text-[#0A1B3C]">{curriculum.code} - {curriculum.name}</p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Curriculum Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. SE_K20"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Year <span className="text-red-500">*</span>
                    </label>
                    <InputNumber
                        className="w-full"
                        value={startYear}
                        onChange={(val) => setStartYear(val || new Date().getFullYear())}
                        min={2000}
                        max={2100}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cohort
                    </label>
                    <Input
                        value={cohort}
                        onChange={(e) => setCohort(e.target.value)}
                        placeholder="e.g. K20"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                    </label>
                    <Input
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="e.g. Regular"
                    />
                </div>
            </div>
        </Modal>
    );
}

export default CloneCurriculumModal;
