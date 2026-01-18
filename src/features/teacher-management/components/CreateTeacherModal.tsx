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

import { useCreateTeacherMutation } from '@/features/teacher-management/services/teachersApi';
import { useGetDepartmentsQuery } from '@/features/department-management/services/departmentsApi';
import { useCreateAccountMutation } from '@/features/account-management/services/accountsApi';
import type { CreateTeacherRequest } from '@/features/teacher-management/types/teacher.types';
import { Role, type CreateAccountRequest } from '@/features/account-management/types/account.types';

interface CreateTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateTeacherModal({ isOpen, onClose }: CreateTeacherModalProps) {
    const [formData, setFormData] = useState({
        teacherCode: '',
        teacherName: '',
        userName: '',
        cardId: '',
        email: '',
        departmentId: '',
    });

    const [createTeacher, { isLoading: isCreatingTeacher }] = useCreateTeacherMutation();
    const [createAccount, { isLoading: isCreatingAccount }] = useCreateAccountMutation();
    const { data: departmentsData, isLoading: isLoadingDepartments } = useGetDepartmentsQuery({
        page: 1,
        pageSize: 1000,
        sortColumn: 'name',
        sortDirection: 'asc'
    });
    const departments = departmentsData?.items || [];

    const isLoading = isCreatingTeacher || isCreatingAccount;

    const resetForm = () => {
        setFormData({
            teacherCode: '',
            teacherName: '',
            userName: '',
            cardId: '',
            email: '',
            departmentId: '',
        });
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.teacherCode.trim()) {
            toast.error('Teacher code cannot be empty');
            return;
        }
        if (!formData.teacherName.trim()) {
            toast.error('Teacher name cannot be empty');
            return;
        }
        if (!formData.userName.trim()) {
            toast.error('Account Username cannot be empty');
            return;
        }
        if (!formData.email.trim()) {
            toast.error('Email cannot be empty');
            return;
        }
        if (!formData.departmentId) {
            toast.error('Please select a department');
            return;
        }

        try {
            // Step 1: Create Account
            const accountPayload: CreateAccountRequest = {
                userName: formData.userName.trim(),
                email: formData.email.trim(),
                fullName: formData.teacherName.trim(),
                role: Role.Teacher,
                password: 'Password@123',
                confirmPassword: 'Password@123',
                emailConfirmed: false,
                phoneNumberConfirmed: false,
                twoFactorEnabled: false,
                lockoutEnabled: false,
                phoneNumber: undefined,
                gender: undefined,
            };

            const accountData = await createAccount(accountPayload).unwrap();
            const accountId = accountData.id;

            if (!accountId) {
                throw new Error('Failed to retrieve Account ID after creation.');
            }

            // Step 2: Create Teacher using Account ID
            const teacherPayload: CreateTeacherRequest = {
                userId: accountId,
                teacherCode: formData.teacherCode.trim(),
                teacherName: formData.teacherName.trim(),
                email: formData.email.trim(),
                departmentId: formData.departmentId,
                cardId: formData.cardId.trim() || undefined,
            };

            await createTeacher(teacherPayload).unwrap();

            toast.success(`Teacher "${formData.teacherName}" added successfully!`);
            handleClose();
        } catch (err: any) {
            let errorMessage = 'Creation failed';

            if (err?.status === 'PARSING_ERROR' && typeof err?.data === 'string') {
                if (err.data.includes('FluentValidation.ValidationException')) {
                    const match = err.data.match(/Validation failed: -- (.*?)\s+Severity:/s);
                    if (match && match[1]) {
                        errorMessage = 'Server Validation Error:\n' + match[1];
                    } else {
                        errorMessage = 'Server Validation Error: ' + err.data.substring(0, 300);
                    }
                } else {
                    errorMessage = `Server Error: ${err.data.substring(0, 200)}...`;
                }
            } else if (err?.data?.errors) {
                const validationErrors = Object.values(err.data.errors).flat().join('\n');
                errorMessage += `:\n${validationErrors}`;
            } else if (err?.data?.result && typeof err.data.result === 'string') {
                errorMessage = `Server Error: ${err.data.result}`;
            } else if (err?.data?.message) {
                let msg = err.data.message;
                if (msg.includes("is already registered")) {
                    msg = msg.replace(/Email '.*?'/, 'Email');
                }
                errorMessage += `: ${msg}`;
            } else if (err?.data?.title) {
                errorMessage += `: ${err.data.title}`;
            } else {
                errorMessage += ': Unknown error';
            }

            // Final safety check for any other path that might have included the email
            if (errorMessage.includes("is already registered")) {
                errorMessage = errorMessage.replace(/Email '.*?'/, 'Email');
            }

            toast.error(errorMessage);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add New Teacher</DialogTitle>
                    <DialogDescription>
                        Enter teacher details to create a new account and profile.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="teacherCode">
                                Teacher Code <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="teacherCode"
                                name="teacherCode"
                                value={formData.teacherCode}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Ex: T001"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="userName">
                                UserName <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="userName"
                                name="userName"
                                value={formData.userName}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Ex: johndoe (No spaces)"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="teacherName">
                            Teacher Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="teacherName"
                            name="teacherName"
                            value={formData.teacherName}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Ex: John Doe"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Ex: example@fe.edu.vn"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cardId">
                                Card ID
                            </Label>
                            <Input
                                id="cardId"
                                name="cardId"
                                value={formData.cardId}
                                onChange={handleChange}
                                disabled={isLoading}
                                placeholder="Ex: 001099000001"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="departmentId">
                            Department <span className="text-red-500">*</span>
                        </Label>
                        <select
                            id="departmentId"
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleChange}
                            disabled={isLoading || isLoadingDepartments}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="" disabled>Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#F37022] hover:bg-[#d95f19] text-white font-medium">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
