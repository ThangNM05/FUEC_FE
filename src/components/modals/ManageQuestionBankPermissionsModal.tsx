import { useState, useMemo } from 'react';
import { X, Search, Shield, UserMinus, UserPlus, Plus } from 'lucide-react';
import { toast } from 'sonner';

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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-[#0A1B3C]">Manage Access</h2>
                            <p className="text-sm text-gray-500">{subjectCode} - {subjectName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-gray-50">

                    {/* Currently Assigned Teachers */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-500" />
                            Assigned Instructors
                        </h3>

                        {isLoadingAssigned ? (
                            <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
                        ) : assignedTeachers.length === 0 ? (
                            <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg">
                                <p className="text-sm text-gray-500">No teachers assigned to managing this bank yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {assignedTeachers.map((teacher) => (
                                    <div key={teacher.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:border-gray-300 transition-colors gap-3">
                                        <div>
                                            <p className="font-semibold text-[#0A1B3C] text-sm">{teacher.teacherCode}</p>
                                            <p className="text-xs text-gray-500">{(teacher as any).accountFullName || (teacher as any).fullName || teacher.teacherCode}</p>
                                        </div>
                                        <button
                                            onClick={() => handleRevoke(teacher.teacherId)}
                                            disabled={isRevoking}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 border border-transparent hover:border-red-100 w-full sm:w-auto justify-center"
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

                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search available teachers..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            />
                        </div>

                        <div className="max-h-60 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
                            {isLoadingTeachers ? (
                                <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /></div>
                            ) : availableTeachers.length === 0 ? (
                                <div className="text-center p-4">
                                    <p className="text-sm text-gray-500">No available teachers found.</p>
                                </div>
                            ) : (
                                availableTeachers.map((teacher) => (
                                    <div key={teacher.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-orange-200 bg-white transition-colors gap-3">
                                        <div>
                                            <p className="font-semibold text-[#0A1B3C] text-sm">{teacher.teacherCode}</p>
                                            <p className="text-xs text-gray-500">{teacher.accountFullName || teacher.teacherCode}</p>
                                        </div>
                                        <button
                                            onClick={() => handleAssign(teacher.id)}
                                            disabled={isAssigning}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-600 hover:text-white hover:bg-orange-500 border border-orange-200 hover:border-orange-500 rounded-lg transition-colors disabled:opacity-50 w-full sm:w-auto justify-center"
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

                {/* Footer */}
                <div className="p-4 sm:p-6 border-t border-gray-100 bg-white sticky bottom-0">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
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
        </div>
    );
}
