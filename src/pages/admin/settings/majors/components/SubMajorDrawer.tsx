import { useState } from 'react';
import { Drawer, Spin, Empty } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { Layers, Edit, Trash2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { useGetSubMajorsByMajorIdQuery } from '@/api/majorsApi';
import { useDeleteSubMajorMutation, useImportSubMajorsMutation } from '@/api/subMajorsApi';
import type { Major } from '@/types/major.types';
import type { SubMajor, ImportSubMajorsResponse } from '@/types/subMajor.types';
import EditSubMajorModal from '@/components/modals/EditSubMajorModal';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import ImportExcelModal from '@/components/shared/ImportExcelModal';
import ImportResultModal from '@/components/shared/ImportResultModal';
import { Download, Upload } from 'lucide-react';

interface SubMajorDrawerProps {
    major: Major | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function SubMajorDrawer({ major, isOpen, onClose }: SubMajorDrawerProps) {
    const { data: subMajors, isLoading } = useGetSubMajorsByMajorIdQuery(major?.id || '', {
        skip: !major?.id
    });
    const [deleteSubMajor] = useDeleteSubMajorMutation();
    const [importSubMajors, { isLoading: isImporting }] = useImportSubMajorsMutation();

    const [selectedSubMajor, setSelectedSubMajor] = useState<SubMajor | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [subMajorToDelete, setSubMajorToDelete] = useState<SubMajor | null>(null);

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isImportResultModalOpen, setIsImportResultModalOpen] = useState(false);
    const [importResult, setImportResult] = useState<ImportSubMajorsResponse | null>(null);

    const handleEdit = (subMajor: SubMajor) => {
        setSelectedSubMajor(subMajor);
        setIsEditModalOpen(true);
    };

    const handleAdd = () => {
        setSelectedSubMajor(null);
        setIsEditModalOpen(true);
    };

    const handleDelete = (subMajor: SubMajor) => {
        setSubMajorToDelete(subMajor);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!subMajorToDelete) return;
        try {
            await deleteSubMajor(subMajorToDelete.id).unwrap();
            toast.success(`Sub-Major "${subMajorToDelete.name}" deleted successfully!`);
            setIsDeleteModalOpen(false);
        } catch (err) {
            toast.error('Deletion failed!');
        }
    };

    const handleImportClick = () => {
        setIsImportModalOpen(true);
    };

    const handleConfirmImport = async (file: File) => {
        toast.info('Processing import...');
        try {
            const result = await importSubMajors(file).unwrap();
            setImportResult(result);
            setIsImportModalOpen(false);
            setIsImportResultModalOpen(true);
            toast.success('Import completed. Please check the results.');
        } catch (err: any) {
            toast.error('Import failed! ' + (err?.data?.message || 'Please check the file or try again later.'));
        }
    };

    return (
        <Drawer
            title={
                <div className="flex items-center justify-between w-full pr-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-[#F37022]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#0A1B3C] leading-tight">
                                {major?.name || 'Sub-Majors'}
                            </h3>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Management Panel
                            </p>
                        </div>
                    </div>
                </div>
            }
            placement="right"
            onClose={onClose}
            open={isOpen}
            width={650}
            closeIcon={<X className="w-5 h-5 text-gray-400" />}
            headerStyle={{ borderBottom: '1px solid #f0f0f0', padding: '20px 24px' }}
            bodyStyle={{ padding: 0, backgroundColor: '#fcfcfc' }}
        >
            <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h4 className="text-sm font-semibold text-gray-700">Specialized Areas</h4>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleImportClick}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
                    >
                        <Upload className="w-4 h-4" />
                        <span>{isImporting ? 'Importing...' : 'Import Excel'}</span>
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F37022] text-white rounded-lg text-sm font-medium hover:bg-[#d95f19] transition-all active:scale-95 shadow-md shadow-orange-100"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Sub-Major</span>
                    </button>
                </div>
            </div>

            <div className="p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Spin indicator={<LoadingOutlined style={{ fontSize: 40, color: '#F37022' }} spin />} />
                    </div>
                ) : !subMajors || subMajors.length === 0 ? (
                    <div className="py-20">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={
                                <div className="text-center">
                                </div>
                            }
                        />
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {subMajors.map((sm) => (
                            <div
                                key={sm.id}
                                className="group bg-white rounded-xl border border-gray-100 p-4 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-50/50 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-[#F37022] border border-orange-100 uppercase tracking-wider">
                                                {sm.code}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${sm.isActive ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'} uppercase tracking-wider`}>
                                                {sm.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <h5 className="text-[15px] font-bold text-[#0A1B3C] group-hover:text-[#F37022] transition-colors mb-1">
                                            {sm.name}
                                        </h5>
                                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                            {sm.description || 'No description provided for this specialized area.'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => handleEdit(sm)}
                                            className="p-2 hover:bg-orange-50 rounded-lg transition-colors group/btn"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4 text-gray-400 group-hover/btn:text-[#F37022]" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sm)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors group/btn"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-gray-400 group-hover/btn:text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EditSubMajorModal
                subMajor={selectedSubMajor}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
            />

            <ConfirmDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={subMajorToDelete?.isActive ? "Confirm Deactivation" : "Confirm Activation"}
                message={`Are you sure you want to ${subMajorToDelete?.isActive ? 'deactivate' : 'activate'} sub-major "${subMajorToDelete?.name}"?`}
                confirmButtonLabel={subMajorToDelete?.isActive ? "Deactivate" : "Activate"}
                confirmButtonVariant={subMajorToDelete?.isActive ? "danger" : "success"}
            />

            <ImportExcelModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onConfirm={handleConfirmImport}
                title="Import Sub-Majors from Excel"
                description="Please ensure the Excel file contains columns: MajorCode, SubMajorCode, SubMajorName, Description"
                templateUrl="/templates/submajor_import_template.xlsx"
            />

            <ImportResultModal
                isOpen={isImportResultModalOpen}
                onClose={() => setIsImportResultModalOpen(false)}
                result={importResult}
                entityName="sub-majors"
            />
        </Drawer>
    );
}
