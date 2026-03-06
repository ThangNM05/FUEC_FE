import { useState, useEffect, useRef, useMemo } from 'react';
import { Edit, Trash2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import DataTable from '@/components/shared/DataTable';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import ImportExcelModal from '@/components/shared/ImportExcelModal';
import ImportResultModal from '@/components/shared/ImportResultModal';
import EditClassModal from '@/components/modals/EditClassModal';
import ClassSubjectDetailModal from '@/components/modals/ClassSubjectDetailModal';
import AutoAssignClassModal from '@/components/modals/AutoAssignClassModal';
import type { Subject } from '@/types/class.types';
import { validateFileUpload } from '@/config/appConfig';

import {
    useGetClassesQuery,
    useDeleteClassMutation,
} from '@/api/classesApi';
import {
    useImportClassSubjectTeachersMutation,
} from '@/api/classDetailsApi';
import type { ImportClassSubjectTeachersResponse } from '@/api/classDetailsApi';
import type { Class } from '@/types/class.types';

function AdminClasses() {
    // Pagination State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortColumn, setSortColumn] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [classToDelete, setClassToDelete] = useState<Class | null>(null);

    // Edit/Create Modal State
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

    // Auto Assign Modal State
    const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);

    // Import Modal State
    const [isImportExcelModalOpen, setIsImportExcelModalOpen] = useState(false);
    const [isImportResultModalOpen, setIsImportResultModalOpen] = useState(false);
    const [importResult, setImportResult] = useState<ImportClassSubjectTeachersResponse | null>(null);

    // RTK Query hooks
    const { data: classesData, isLoading, error } = useGetClassesQuery({
        page,
        pageSize,
        sortColumn,
        sortDirection,
        searchTerm
    });

    const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();
    const [importClassSubjectTeachers, { isLoading: isImporting }] = useImportClassSubjectTeachersMutation();

    // Group classes by Subject for "Grouped View"
    const groupedSubjects = useMemo(() => {
        if (!classesData?.items) return [];

        const groups: Record<string, { id: string, displaySubject: Subject | null, classes: Class[] }> = {};
        const noSubjectKey = 'no-subject';

        classesData.items.forEach(cls => {
            if (cls.subjects && cls.subjects.length > 0) {
                cls.subjects.forEach(sub => {
                    if (!groups[sub.id]) {
                        groups[sub.id] = {
                            id: sub.id,
                            displaySubject: sub,
                            classes: []
                        };
                    }
                    groups[sub.id].classes.push(cls);
                });
            } else {
                if (!groups[noSubjectKey]) {
                    groups[noSubjectKey] = {
                        id: noSubjectKey,
                        displaySubject: null,
                        classes: []
                    };
                }
                groups[noSubjectKey].classes.push(cls);
            }
        });

        // Convert to array and sort by Subject Code
        return Object.values(groups).sort((a, b) => {
            const codeA = a.displaySubject?.code || 'ZZZ'; // 'ZZZ' puts no-subject last
            const codeB = b.displaySubject?.code || 'ZZZ';
            return codeA.localeCompare(codeB);
        });
    }, [classesData]);

    const totalClasses = classesData?.totalItemCount || 0;

    // Handle Delete
    const handleDelete = (item: any) => {
        setClassToDelete(item.originalClass);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!classToDelete) return;

        try {
            await deleteClass(classToDelete.id).unwrap();
            toast.success(`Class "${classToDelete.classCode}" deleted successfully!`);
            setClassToDelete(null);
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error('Deletion failed! ' + ((err as any)?.data?.message || (err as any)?.message || 'Unknown error'));
        }
    };

    // Handle Edit
    const handleEdit = (item: any) => {
        setSelectedClass(item.originalClass);
        setIsEditModalOpen(true);
    };

    // Handle Create
    const handleCreate = () => {
        setSelectedClass(null);
        setIsEditModalOpen(true);
    };

    const handleSubjectClick = (classItem: Class, subject: Subject) => {
        setSelectedClass(classItem);
        setSelectedSubject(subject);
        setIsDetailModalOpen(true);
    };

    const handleAutoAssign = () => {
        setIsAutoAssignModalOpen(true);
    };

    // Handle Import
    const handleImportClick = () => {
        setIsImportExcelModalOpen(true);
    };

    const handleConfirmImport = async (file: File) => {
        const validation = validateFileUpload(file);
        if (!validation.isValid) {
            toast.error(validation.errors.join('\n'));
            return;
        }

        toast.info('Processing import...');

        try {
            const result = await importClassSubjectTeachers(file).unwrap();
            setImportResult(result);
            setIsImportExcelModalOpen(false);
            setIsImportResultModalOpen(true);
            toast.success('Import completed. Please check the results.');
        } catch (err) {
            toast.error('Import failed! Please check the file or try again later.');
        }
    };

    const handleSortChange = (column: keyof Class, direction: 'asc' | 'desc') => {
        setSortColumn(column as string);
        setSortDirection(direction);
    };

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);
        setPage(1);
    };

    const columns = [
        {
            header: 'Subject Code',
            accessor: 'displaySubject' as any,
            sortable: false,
            filterable: false,
            className: 'w-[10%] px-4',
            render: (item: any) => (
                <div className="flex items-center">
                    {item.displaySubject ? (
                        <span
                            className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200 select-none"
                            title={item.displaySubject.name}
                        >
                            {item.displaySubject.code}
                        </span>
                    ) : (
                        <span className="text-gray-400 text-xs italic">-</span>
                    )}
                </div>
            )
        },
        {
            header: 'Subject Name',
            accessor: 'displaySubject' as any,
            sortable: false,
            filterable: false,
            className: 'w-[25%] px-4',
            render: (item: any) => (
                <div className="flex items-center">
                    {item.displaySubject ? (
                        <span className="text-sm text-[#0A1B3C] font-medium truncate" title={item.displaySubject.name}>
                            {item.displaySubject.name}
                        </span>
                    ) : (
                        <span className="text-gray-400 text-xs italic">Classes with no subject</span>
                    )}
                </div>
            )
        },
        {
            header: 'Classes',
            accessor: 'classes' as any,
            sortable: false,
            filterable: false,
            className: 'w-[45%] px-4',
            render: (item: any) => (
                <div className="flex flex-wrap gap-2">
                    {item.classes.map((cls: Class) => (
                        <span
                            key={cls.id}
                            className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer transition-colors select-none"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (item.displaySubject) {
                                    handleSubjectClick(cls, item.displaySubject);
                                }
                            }}
                            title={`Manage ${cls.classCode} Details`}
                        >
                            {cls.classCode}
                        </span>
                    ))}
                </div>
            )
        },
        {
            header: 'Actions',
            accessor: 'id' as any,
            className: 'w-[20%] px-4 text-center',
            render: (_: any) => (
                <span className="text-xs text-gray-400">Select a class to manage</span>
            )
        }
    ];


    // Show error toast only once
    const hasShownError = useRef(false);
    useEffect(() => {
        if (error && !hasShownError.current) {
            toast.error('Failed to load classes.');
            hasShownError.current = true;
        }
        if (!error) {
            hasShownError.current = false;
        }
    }, [error]);

    if (isLoading) {
        return (
            <div className="p-4 md:p-6">
                <div className="mb-4 md:mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Class Management</h1>
                </div>
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div
                        className="w-12 h-12 border-4 border-[#F37022] border-t-transparent rounded-full"
                        style={{ animation: 'spin 1s linear infinite' }}
                    />
                </div>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Class Management</h1>
            </div>

            <DataTable
                title={`All Classes (${totalClasses})`}
                data={groupedSubjects}
                columns={columns}
                onCreate={handleCreate}
                createLabel="Add Class"
                selectable={true}
                manualPagination={true}
                totalItems={totalClasses}
                page={page}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={setPageSize}
                onSortChange={handleSortChange as any}
                onSearchChange={handleSearchChange}
                searchTerm={searchTerm}
                onImport={handleImportClick}
                importLabel={isImporting ? 'Importing...' : 'Import Excel'}
                onSecondaryAction={handleAutoAssign}
                secondaryActionLabel="Auto Generate"
                secondaryActionIcon={<Wand2 className="w-4 h-4" />}
            />

            <EditClassModal
                classData={selectedClass}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ClassSubjectDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                classData={selectedClass}
                subject={selectedSubject}
            />

            <AutoAssignClassModal
                isOpen={isAutoAssignModalOpen}
                onClose={() => setIsAutoAssignModalOpen(false)}
                onSuccess={() => {
                    // Refetch data handles it automatically via tags invalidation? 
                    // RTK Query handles it if invalidatesTags is set correctly.
                    setIsAutoAssignModalOpen(false);
                }}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                message={`Are you sure you want to delete class "${classToDelete?.classCode}"?`}
                itemName={classToDelete?.classCode}
            />

            <ImportExcelModal
                isOpen={isImportExcelModalOpen}
                onClose={() => setIsImportExcelModalOpen(false)}
                onConfirm={handleConfirmImport}
                title="Import Class Subject Teacher Assignments"
                description="Please ensure the Excel file contains columns: SemesterCode, ClassCode, SubjectCode, TeacherCode"
                templateUrl="/templates/class_subject_teacher_import_template.xlsx"
            />

            <ImportResultModal
                isOpen={isImportResultModalOpen}
                onClose={() => setIsImportResultModalOpen(false)}
                result={importResult}
                entityName="records"
            />
        </div>
    );
}

export default AdminClasses;
