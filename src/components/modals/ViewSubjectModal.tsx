import { Modal, Button, Tag, Descriptions } from 'antd';
import type { Subject } from '@/types/subject.types';

interface ViewSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: Subject | null;
}

export default function ViewSubjectModal({ isOpen, onClose, subject }: ViewSubjectModalProps) {
    if (!subject) return null;

    return (
        <Modal
            title="Subject Details"
            open={isOpen}
            onCancel={onClose}
            width={800}
            footer={[
                <Button
                    key="close"
                    type="primary"
                    onClick={onClose}
                    className="bg-[#F37022] hover:bg-[#d95f19] border-none px-6"
                >
                    Close
                </Button>
            ]}
        >
            <div className="py-4">
                <Descriptions bordered column={1} labelStyle={{ width: '200px', fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                    <Descriptions.Item label="Subject Code">{subject.code}</Descriptions.Item>
                    <Descriptions.Item label="Subject Name">{subject.name}</Descriptions.Item>
                    <Descriptions.Item label="Credits">{subject.credits}</Descriptions.Item>
                    <Descriptions.Item label="Pass Mark">{subject.minAvgMarkToPass}</Descriptions.Item>
                    <Descriptions.Item label="Time Allocation">{subject.timeAllocation || '-'}</Descriptions.Item>
                    <Descriptions.Item label="Description">
                        <div className="whitespace-pre-wrap">{subject.description || 'No description provided.'}</div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={subject.isActive ? 'success' : 'error'}>
                            {subject.isActive ? 'Active' : 'Inactive'}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>
            </div>
        </Modal>
    );
}
