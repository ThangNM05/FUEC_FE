import { useState, useMemo } from 'react';
import { Search, Shield, UserMinus, UserPlus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Input, Button } from 'antd';

import {
    useGetTeachersBySubjectIdQuery,
    useAssignTeacherMutation,
    useRevokeTeacherMutation
} from '@/api/questionBanksApi';
import { useGetTeachersQuery } from '@/api/teachersApi';

interface ManageQuestionBankPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string | null;
    subjectCode: string;
    subjectName: string;
}

export default function ManageQuestionBankPermissionsModal({
    isOpen,
    onClose,
    subjectId,
    subjectCode,
    subjectName
}: ManageQuestionBankPermissionsModalProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch assigned teachers
    const {
        data: assignedTeachers = [],
        isLoading: isLoadingAssigned
    } = useGetTeachersBySubjectIdQuery(subjectId || '', {
        skip: !subjectId,
    });

    // Fetch all teachers for dropdown
    const {
        data: teachersData,
        isLoading: isLoadingTeachers
    } = useGetTeachersQuery({ page: 1, pageSize: 1000 });

    const [assignTeacher, { isLoading: isAssigning }] = useAssignTeacherMutation();
    const [revokeTeacher, { isLoading: isRevoking }] = useRevokeTeacherMutation();

    // Filter available teachers: exclude already assigned, then search
    const availableTeachers = useMemo(() => {
        if (!teachersData?.items) return [];
        const assignedIds = new Set(assignedTeachers.map(t => t.teacherId));
        return teachersData.items
            .filter(t => !assignedIds.has(t.id))
            .filter(t => {
                if (!searchTerm.trim()) return true;
                const q = searchTerm.toLowerCase();
                return (
                    t.teacherCode.toLowerCase().includes(q) ||
                    (t.accountFullName || '').toLowerCase().includes(q)
                );
            });
    }, [teachersData?.items, assignedTeachers, searchTerm]);

    if (!isOpen || !subjectId) return null;

    const handleAssign = async (teacherId: string) => {
        try {
            await assignTeacher({ subjectId, teacherId }).unwrap();
            toast.success('Teacher assigned successfully');
        } catch (error) {
            toast.error('Failed to assign teacher');
        }
    };

    const handleRevoke = async (teacherId: string) => {
        try {
            await revokeTeacher({ subjectId, teacherId }).unwrap();
            toast.success('Access revoked successfully');
        } catch (error) {
            toast.error('Failed to revoke access');
        }
    };

    const titleNode = (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex flex-shrink-0 items-center justify-center text-orange-600">
                <Shield className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-[#0A1B3C] leading-tight">Manage Access</h2>
                <p className="text-sm text-gray-500 font-normal mt-0.5">{subjectCode} - {subjectName}</p>
            </div>
        </div>
    );

    return (
        <Modal
            title={titleNode}
            open={isOpen}
            onCancel={onClose}
            width={650}
            footer={[
                <Button key="close" onClick={onClose} size="large">
                    Close
                </Button>
            ]}
        >
            <div className="flex flex-col gap-6 py-4">

                {/* Currently Assigned Teachers */}
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-500" />
                        Assigned Instructors
                    </h3>

                    {isLoadingAssigned ? (
                        <div className="flex justify-center p-4">
                            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : assignedTeachers.length === 0 ? (
                        <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-sm text-gray-500">No teachers assigned to managing this bank yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {assignedTeachers.map((teacher) => (
                                <div key={teacher.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:border-gray-300 transition-colors gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[#0A1B3C] text-sm truncate">{teacher.teacherCode}</p>
                                        <p className="text-xs text-gray-500 truncate">{(teacher as any).accountFullName || (teacher as any).fullName || teacher.teacherCode}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRevoke(teacher.teacherId)}
                                        disabled={isRevoking}
                                        className="flex items-center flex-shrink-0 gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-transparent hover:border-red-100 w-full sm:w-auto justify-center"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                        Revoke Access
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Assign New Teacher */}
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <UserPlus className="w-4 h-4 text-blue-500" />
                        Assign New Instructor
                    </h3>

                    <div className="mb-4">
                        <Input
                            prefix={<Search className="w-4 h-4 text-gray-400" />}
                            placeholder="Search available teachers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="large"
                            allowClear
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                        {isLoadingTeachers ? (
                            <div className="flex justify-center p-4">
                                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : availableTeachers.length === 0 ? (
                            <div className="text-center p-4">
                                <p className="text-sm text-gray-500">No available teachers found.</p>
                            </div>
                        ) : (
                            availableTeachers.map((teacher) => (
                                <div key={teacher.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-orange-200 bg-white transition-colors gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[#0A1B3C] text-sm truncate">{teacher.teacherCode}</p>
                                        <p className="text-xs text-gray-500 truncate">{teacher.accountFullName || teacher.teacherCode}</p>
                                    </div>
                                    <button
                                        onClick={() => handleAssign(teacher.id)}
                                        disabled={isAssigning}
                                        className="flex items-center flex-shrink-0 gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-white hover:bg-[#F37022] border border-orange-200 hover:border-[#F37022] rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Assign
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E5E7EB;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D1D5DB;
                }
            `}</style>
        </Modal>
    );
}
