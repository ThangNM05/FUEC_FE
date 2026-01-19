import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateSubjectMutation } from '@/features/subject-management/services/subjectsApi';
import type { Subject } from '@/features/subject-management/types/subject.types';

interface EditSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: Subject | null;
}

export default function EditSubjectModal({ isOpen, onClose, subject }: EditSubjectModalProps) {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        credits: 0,
        terms: 0,
        timeAllocation: '',
        description: '',
        minAvgMarkToPass: 0,
        isActive: true
    });

    const [updateSubject, { isLoading }] = useUpdateSubjectMutation();

    useEffect(() => {
        if (subject) {
            const formattedTime = subject.timeAllocation || '';

            setFormData({
                code: subject.code,
                name: subject.name,
                credits: subject.credits,
                terms: subject.terms,
                timeAllocation: formattedTime,
                description: subject.description || '',
                minAvgMarkToPass: subject.minAvgMarkToPass,
                isActive: subject.isActive
            });
        }
    }, [subject]);

    const handleClose = () => {
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'credits' || name === 'terms' || name === 'minAvgMarkToPass'
                ? parseInt(value) || 0
                : value
        }));
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject) return;

        if (!formData.code || !formData.name) {
            toast.error('Code and Name are required');
            return;
        }

        const submitData = { ...formData };

        try {
            await updateSubject({
                id: subject.id,
                ...submitData
            }).unwrap();

            toast.success(`Subject "${formData.name}" updated successfully!`);
            handleClose();
        } catch (err: any) {
            console.error('Failed to update subject', err);
            toast.error(err?.data?.message || 'Failed to update subject');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Subject</DialogTitle>
                    <DialogDescription>
                        Update details for {subject?.name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-code">Code <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit-code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                disabled={true}
                                className="bg-gray-100"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit-name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-credits">Credits</Label>
                            <Input
                                id="edit-credits"
                                name="credits"
                                type="number"
                                min="0"
                                value={formData.credits}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-terms">Terms</Label>
                            <Input
                                id="edit-terms"
                                name="terms"
                                type="number"
                                min="1"
                                value={formData.terms}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-minAvgMarkToPass">Pass Mark</Label>
                            <Input
                                id="edit-minAvgMarkToPass"
                                name="minAvgMarkToPass"
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={formData.minAvgMarkToPass}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-timeAllocation">Time Allocation</Label>
                        <Input
                            id="edit-timeAllocation"
                            name="timeAllocation"
                            value={formData.timeAllocation}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <textarea
                            id="edit-description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#F37022] hover:bg-[#d95f19] text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
