import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { Spin, Descriptions, Tag, Empty } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { useGetCurriculumByIdQuery, useGetCurriculumSubjectsQuery } from '@/api/curriculumsApi';
import type { CurriculumSubject } from '@/types/curriculum.types';
import DataTable from '@/components/shared/DataTable';

function CurriculumDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Fetch details
    const { data: curriculum, isLoading: isLoadingCurriculum } = useGetCurriculumByIdQuery(id || '');
    const { data: subjects = [], isLoading: isLoadingSubjects } = useGetCurriculumSubjectsQuery(id || '');

    const handleBack = () => {
        navigate('/admin/settings/curriculum');
    };

    if (isLoadingCurriculum) {
        const antIcon = <LoadingOutlined style={{ fontSize: 48, color: '#F37022' }} spin />;
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Spin indicator={antIcon} tip="Loading curriculum details..." />
            </div>
        );
    }

    if (!curriculum) {
        return (
            <div className="p-6">
                <button
                    onClick={handleBack}
                    className="flex items-center text-gray-500 hover:text-[#F37022] mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Curriculums
                </button>
                <Empty description="Curriculum not found" />
            </div>
        );
    }

    // Table columns for Curriculum Subjects
    const columns = [
        {
            header: 'Subject Code',
            accessor: 'subjectCode' as keyof CurriculumSubject,
            sortable: true,
            filterable: true,
            className: 'w-[20%]',
            render: (item: CurriculumSubject) => (
                <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{item.subjectCode}</span>
                </div>
            ),
        },
        {
            header: 'Subject Name',
            accessor: 'subjectName' as keyof CurriculumSubject,
            sortable: true,
            filterable: true,
            className: 'w-[40%]',
        },
        {
            header: 'Credits',
            accessor: 'subjectCredits' as keyof CurriculumSubject,
            align: 'center' as const,
            className: 'w-[10%]',
            render: (item: CurriculumSubject) => (
                <span className="font-medium">{item.subjectCredits ?? '-'}</span>
            ),
        },
        {
            header: 'Term',
            accessor: 'term' as keyof CurriculumSubject,
            sortable: true,
            align: 'center' as const,
            className: 'w-[10%]',
            render: (item: CurriculumSubject) => (
                <Tag color="cyan">Term {item.term}</Tag>
            ),
        },
        {
            header: 'Status',
            accessor: 'isActive' as keyof CurriculumSubject,
            align: 'center' as const,
            className: 'w-[15%]',
            render: (item: CurriculumSubject) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${item.isActive
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                        }`}
                >
                    {item.isActive ? 'Active' : 'Inactive'}
                </span>
            ),
        },
    ];

    return (
        <div className="p-4 md:p-6 pb-24">
            <button
                onClick={handleBack}
                className="flex items-center text-gray-500 hover:text-[#F37022] mb-4 md:mb-6 transition-colors"
                aria-label="Back to curriculums"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>Back to Curriculums</span>
            </button>

            {/* Header section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0A1B3C] mb-1">
                            {curriculum.name}
                        </h1>
                        <span className="text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {curriculum.code}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Tag color={curriculum.isActive ? 'success' : 'error'} className="m-0 text-sm py-1 px-3">
                            {curriculum.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                    </div>
                </div>

                <Descriptions bordered column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }} className="mt-4">
                    <Descriptions.Item label="Start Year">
                        <span className="font-semibold">{curriculum.startYear}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Cohort">
                        {curriculum.cohort || <span className="text-gray-400">N/A</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Terms">
                        {curriculum.totalTerms}
                    </Descriptions.Item>
                    <Descriptions.Item label="Total Subjects">
                        {curriculum.subjectCount}
                    </Descriptions.Item>
                    <Descriptions.Item label="Specialization" span={2}>
                        {curriculum.subMajorName || <span className="text-gray-400">N/A</span>}
                    </Descriptions.Item>
                    {curriculum.description && (
                        <Descriptions.Item label="Description" span={3}>
                            {curriculum.description}
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </div>

            {/* Subjects Table */}
            {isLoadingSubjects ? (
                <div className="bg-white rounded-xl p-8 flex justify-center items-center">
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 32, color: '#F37022' }} spin />} tip="Loading subjects..." />
                </div>
            ) : (
                <DataTable
                    title={`Curriculum Subjects (${subjects.length})`}
                    data={subjects}
                    columns={columns}
                    manualPagination={false}
                />
            )}
        </div>
    );
}

export default CurriculumDetail;