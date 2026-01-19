import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Subject } from '@/features/subject-management/types/subject.types';

interface ViewSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: Subject | null;
}

export default function ViewSubjectModal({ isOpen, onClose, subject }: ViewSubjectModalProps) {
    if (!subject) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Subject Details</DialogTitle>
                    <DialogDescription>
                        Detailed information for {subject.code} - {subject.name}
                    </DialogDescription>
                </DialogHeader>

                <div className="border rounded-md overflow-hidden text-sm">
                    {/* Code */}
                    <div className="flex border-b">
                        <div className="w-1/4 bg-gray-50 p-3 font-semibold text-gray-700 border-r flex items-center">
                            Subject Code:
                        </div>
                        <div className="w-3/4 p-3 font-medium text-gray-900">
                            {subject.code}
                        </div>
                    </div>

                    {/* Name */}
                    <div className="flex border-b">
                        <div className="w-1/4 bg-gray-50 p-3 font-semibold text-gray-700 border-r flex items-center">
                            Subject Name:
                        </div>
                        <div className="w-3/4 p-3 font-medium text-gray-900">
                            {subject.name}
                        </div>
                    </div>

                    {/* Credits */}
                    <div className="flex border-b">
                        <div className="w-1/4 bg-gray-50 p-3 font-semibold text-gray-700 border-r flex items-center">
                            Credits:
                        </div>
                        <div className="w-3/4 p-3 text-gray-900">
                            {subject.credits}
                        </div>
                    </div>

                    {/* Terms */}
                    <div className="flex border-b">
                        <div className="w-1/4 bg-gray-50 p-3 font-semibold text-gray-700 border-r flex items-center">
                            Terms:
                        </div>
                        <div className="w-3/4 p-3 text-gray-900">
                            {subject.terms}
                        </div>
                    </div>

                    {/* Pass Mark */}
                    <div className="flex border-b">
                        <div className="w-1/4 bg-gray-50 p-3 font-semibold text-gray-700 border-r flex items-center">
                            Pass Mark:
                        </div>
                        <div className="w-3/4 p-3 text-gray-900">
                            {subject.minAvgMarkToPass}
                        </div>
                    </div>

                    {/* Time Allocation */}
                    <div className="flex border-b">
                        <div className="w-1/4 bg-gray-50 p-3 font-semibold text-gray-700 border-r flex items-center">
                            Time Allocation:
                        </div>
                        <div className="w-3/4 p-3 text-gray-900">
                            {subject.timeAllocation || '-'}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="flex border-b">
                        <div className="w-1/4 bg-gray-50 p-3 font-semibold text-gray-700 border-r flex items-center">
                            Description:
                        </div>
                        <div className="w-3/4 p-3 text-gray-900 whitespace-pre-wrap">
                            {subject.description || 'No description provided.'}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="flex">
                        <div className="w-1/4 bg-gray-50 p-3 font-semibold text-gray-700 border-r flex items-center">
                            Status:
                        </div>
                        <div className="w-3/4 p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${subject.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {subject.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <Button
                        onClick={onClose}
                        className="bg-[#F37022] hover:bg-[#d95f19] text-white px-6"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
