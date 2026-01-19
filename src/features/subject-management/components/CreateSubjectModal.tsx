import { useState } from 'react';
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

import { useCreateSubjectMutation } from '@/features/subject-management/services/subjectsApi';

interface CreateSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateSubjectModal({ isOpen, onClose }: CreateSubjectModalProps) {
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        credits: 3,
        terms: 1,
        timeAllocation: '',
        description: '',
        minAvgMarkToPass: 5,
        isActive: true
    });

    const [createSubject, { isLoading }] = useCreateSubjectMutation();

    const resetForm = () => {
        setFormData({
            code: '',
            name: '',
            credits: 3,
            terms: 1,
            timeAllocation: '',
            description: '',
            minAvgMarkToPass: 5,
            isActive: true
        });
    };

    const handleClose = () => {
        resetForm();
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

        if (!formData.code || !formData.name) {
            toast.error('Code and Name are required');
            return;
        }

        try {
            await createSubject(formData).unwrap();
            toast.success(`Subject "${formData.name}" created successfully!`);
            handleClose();
        } catch (err: any) {
            console.error('Failed to create subject', err);
            toast.error(err?.data?.message || 'Failed to create subject');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Subject</DialogTitle>
                    <DialogDescription>
                        Add a new subject to the curriculum.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="code">Code <span className="text-red-500">*</span></Label>
                            <Input
                                id="code"
                                name="code"
                                placeholder="e.g. SWE201"
                                value={formData.code}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Software Engineering"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="credits">Credits</Label>
                            <Input
                                id="credits"
                                name="credits"
                                type="number"
                                min="0"
                                value={formData.credits}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="terms">Terms</Label>
                            <Input
                                id="terms"
                                name="terms"
                                type="number"
                                min="1"
                                value={formData.terms}
                                onChange={handleChange}
                                disabled={isLoading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="minAvgMarkToPass">Pass Mark</Label>
                            <Input
                                id="minAvgMarkToPass"
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
                        <Label htmlFor="timeAllocation">Time Allocation</Label>
                        <Input
                            id="timeAllocation"
                            name="timeAllocation"
                            placeholder="e.g. 45h Theory, 30h Lab"
                            value={formData.timeAllocation}
                            onChange={handleChange}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="Subject description..."
                            value={formData.description}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="isActive">Status</Label>
                        <select
                            id="isActive"
                            name="isActive"
                            value={formData.isActive.toString()}
                            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                            disabled={isLoading}
                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#F37022] hover:bg-[#d95f19] text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Subject
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
