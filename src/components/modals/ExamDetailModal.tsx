import { Modal, Descriptions, Spin, Table, Tag } from 'antd';
import { Calendar, ClipboardCheck, Lock, Globe, Shield, RefreshCw } from 'lucide-react';
import { useGetExamQuestionsQuery } from '@/api/examsApi';
import type { Exam } from '@/types/exam.types';

interface ExamDetailModalProps {
    exam: Exam | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ExamDetailModal({ exam, isOpen, onClose }: ExamDetailModalProps) {
    const { data: questionsData, isLoading } = useGetExamQuestionsQuery(
        { examId: exam?.id || '' },
        { skip: !exam?.id || !isOpen }
    );

    const questions = questionsData?.items || [];

    const columns = [
        {
            title: '#',
            key: 'index',
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: 'Question Content',
            dataIndex: 'questionContent',
            key: 'content',
            render: (text: string) => (
                <div className="max-w-xl whitespace-pre-wrap">{text}</div>
            ),
        },
        {
            title: 'Points',
            dataIndex: 'points',
            key: 'points',
            width: 100,
            render: (points: number) => <Tag color="blue">{points} pts</Tag>,
        },
    ];

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-[#F37022]" />
                    <span>Exam Details: {exam?.category} {exam?.displayName ? `- ${exam.displayName}` : ''}</span>
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            width={1000}
            footer={null}
            centered
            className="exam-detail-modal"
        >
            {exam ? (
                <div className="space-y-6 py-4">
                    {/* Exam Info */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <Descriptions column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }} bordered size="small">
                            <Descriptions.Item label="Starts At">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {new Date(exam.startTime).toLocaleString()}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Ends At">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    {new Date(exam.endTime).toLocaleString()}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Security Mode">
                                <div className="flex items-center gap-2">
                                    {exam.securityMode === 2 ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 text-purple-500" />
                                            <Tag color="purple">Dynamic Code ({exam.codeDuration}s)</Tag>
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4 text-gray-500" />
                                            <Tag color="default">Static Code</Tag>
                                        </>
                                    )}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="IP Check">
                                <div className="flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-orange-500" />
                                    {exam.requireIpCheck ? (
                                        <Tag color="orange">Enabled</Tag>
                                    ) : (
                                        <Tag color="default">Disabled</Tag>
                                    )}
                                </div>
                            </Descriptions.Item>
                            <Descriptions.Item label="Allowed IPs">
                                {exam.allowedIpRanges || 'Any'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Grade Status">
                                {exam.isPublicGrade ? (
                                    <Tag color="green">Public</Tag>
                                ) : (
                                    <Tag color="volcano">Private</Tag>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Syllabus" span={3}>
                                {exam.syllabusName} ({exam.weight}%)
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    {/* Questions Table */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-[#0A1B3C] flex items-center gap-2">
                                <Shield className="w-5 h-5 text-[#F37022]" />
                                Exam Questions ({questions.length})
                            </h3>
                        </div>
                        <Table
                            columns={columns}
                            dataSource={questions}
                            rowKey="id"
                            loading={isLoading}
                            pagination={{ pageSize: 10 }}
                            bordered
                            size="middle"
                        />
                    </div>
                </div>
            ) : (
                <div className="py-20 text-center">
                    <Spin tip="Loading exam details..." />
                </div>
            )}
        </Modal>
    );
}
