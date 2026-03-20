import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
    ChevronRight, Calendar, Clock, Send, CheckCircle, FileText,
    Loader2, AlertCircle, MessageSquare, Lock, Users, ExternalLink,
    RotateCcw,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import FileUploader from '@/components/FileUploader';
import FileTreeView from '@/components/FileTreeView';
import { useGetAssignmentByIdQuery } from '@/api/assignmentsApi';
import { useGetStudentAssignmentsByAssignmentIdQuery, useSubmitAssignmentMutation } from '@/api/studentAssignmentsApi';
import { useGetAssignmentFeedbacksQuery } from '@/api/assignmentFeedbacksApi';
import { useUploadFileMutation } from '@/api/filesApi';
import { selectCurrentUser } from '@/redux/authSlice';
import { AssignmentStatusLabel, AssignmentStatusColor } from '@/types/assignment.types';

interface UploadedFile {
    name: string;
    path: string;
    size: number;
    type: string;
    file: File;
}

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    size?: number;
    children?: FileNode[];
}

function AssignmentSubmission() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const currentUser = useSelector(selectCurrentUser);

    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);

    // Fetch assignment data from API
    const {
        data: assignment,
        isLoading: isLoadingAssignment,
        isError: isAssignmentError,
    } = useGetAssignmentByIdQuery(id!, { skip: !id });

    // Fetch submission history for this assignment (filtered by current student)
    const {
        data: submissionsData,
        isLoading: isLoadingSubmissions,
    } = useGetStudentAssignmentsByAssignmentIdQuery(id!, { skip: !id });

    const mySubmissions = (submissionsData?.items ?? []).filter(
        (s) => s.studentId === currentUser?.entityId
    );
    const latestSubmission = mySubmissions[0] ?? null;
    const isSubmitted = !!latestSubmission;

    // Fetch instructor feedback for the latest submission
    const { data: feedbacks } = useGetAssignmentFeedbacksQuery(latestSubmission?.id ?? '', { skip: !latestSubmission?.id });

    // Submit mutation
    const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();
    const [uploadFile] = useUploadFileMutation();

    // Build file tree from uploaded files
    const buildFileTree = (files: UploadedFile[]): FileNode[] => {
        const root: FileNode[] = [];
        const folderMap: Map<string, FileNode> = new Map();

        files.forEach((file) => {
            const pathParts = file.path.split('/');
            let currentLevel = root;
            let currentPath = '';

            pathParts.forEach((part, index) => {
                currentPath = currentPath ? `${currentPath}/${part}` : part;
                const isLastPart = index === pathParts.length - 1;

                if (isLastPart) {
                    currentLevel.push({
                        name: part,
                        path: currentPath,
                        type: 'file',
                        size: file.size,
                    });
                } else {
                    let folder = folderMap.get(currentPath);
                    if (!folder) {
                        folder = {
                            name: part,
                            path: currentPath,
                            type: 'folder',
                            children: [],
                        };
                        folderMap.set(currentPath, folder);
                        currentLevel.push(folder);
                    }
                    currentLevel = folder.children!;
                }
            });
        });

        return root;
    };

    const handleFilesChange = (files: UploadedFile[]) => {
        setUploadedFiles(files);
        const tree = buildFileTree(files);
        setFileTree(tree);
    };

    const handleSubmit = async () => {
        if (uploadedFiles.length === 0) {
            alert('Please upload files before submitting');
            return;
        }
        if (!currentUser?.entityId || !id) {
            alert('User information not found. Please sign in again.');
            return;
        }

        setSubmitError(null);

        try {
            // Step 1: Upload file to server → receive real fileId
            setUploadProgress('Uploading file...');
            const fileToUpload = uploadedFiles[0].file;
            const uploadedFileDto = await uploadFile({
                file: fileToUpload,
                folder: 'assignments',
            }).unwrap();

            // Step 2: Submit assignment with real submissionFileId (GUID)
            setUploadProgress('Submitting assignment...');
            await submitAssignment({
                studentId: currentUser.entityId,
                assignmentId: id,
                submissionFileId: uploadedFileDto.id,  // real GUID from API
                status: 1,
            }).unwrap();

            setUploadProgress(null);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                setUploadedFiles([]);
                setFileTree([]);
            }, 3000);
        } catch (err: any) {
            console.error('Submit failed:', err);
            setUploadProgress(null);
            setSubmitError(
                err?.data?.message ||
                err?.error ||
                'Submission failed. Please try again.'
            );
        }
    };

    const getDaysRemaining = () => {
        if (!assignment?.dueDate) return null;
        const now = new Date();
        const diff = new Date(assignment.dueDate).getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const daysRemaining = getDaysRemaining();

    // ── Loading State ──
    if (isLoadingAssignment) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#F37022]" />
                <p className="text-gray-500 text-sm">Loading assignment...</p>
            </div>
        );
    }

    // ── Error State ──
    if (isAssignmentError || !assignment) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="text-gray-600 font-medium">Assignment not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-sm text-[#F37022] hover:underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    const courseName = assignment.subjectCode ?? 'Course';
    const courseCode = assignment.classCode ?? '';

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <button onClick={() => navigate('/student')} className="hover:text-[#F37022] transition-colors">
                    Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <button
                    onClick={() => navigate(`/student/course-details/${assignment.classSubjectId}`)}
                    className="hover:text-[#F37022] transition-colors"
                >
                    {courseName}
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">Assignment Submission</span>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-3">
                    {assignment.displayName ?? `Assignment #${assignment.instanceNumber}`}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    {assignment.dueDate && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                    )}
                    {daysRemaining !== null && (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span
                                className={`font-medium ${daysRemaining < 0
                                    ? 'text-red-600'
                                    : daysRemaining <= 7
                                        ? 'text-orange-600'
                                        : 'text-gray-700'
                                    }`}
                            >
                                {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days remaining`}
                            </span>
                        </div>
                    )}
                    {courseCode && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            {courseCode}
                        </span>
                    )}
                </div>
            </div>

            {/* Instructions */}
            {assignment.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
                    <h2 className="text-lg font-bold text-[#0A1B3C] mb-3">Instructions</h2>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                        {assignment.description}
                    </div>
                </div>
            )}

            {/* Main Content – Google Classroom style */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ── LEFT: Upload + Class Comments ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* File Upload area */}
                    <FileUploader onFilesChange={handleFilesChange} />

                    {fileTree.length > 0 && (
                        <div>
                            <h3 className="text-base font-bold text-[#0A1B3C] mb-3">File Structure Preview</h3>
                            <FileTreeView files={fileTree} />
                        </div>
                    )}

                    {/* Instructor Feedback History */}
                    {feedbacks && feedbacks.length > 0 && (
                        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden animate-slideIn">
                            <div className="px-6 py-4 border-b border-orange-50 bg-orange-50/30">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-[#F37022]" />
                                    <h2 className="font-bold text-[#0A1B3C]">Instructor Feedback History</h2>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {feedbacks.slice().reverse().map((fb, idx) => (
                                    <div key={fb.id || idx} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A1B3C] to-[#1a2d5a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-sm">
                                            {fb.teacherName?.charAt(0) ?? 'T'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-[#0A1B3C]">
                                                        {fb.teacherName ?? 'Instructor'}
                                                    </p>
                                                    {fb.grade !== null && (
                                                        <span className="text-[10px] font-bold text-[#F37022] bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                                            Grade: {fb.grade}/100
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(fb.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 italic text-gray-700 text-sm leading-relaxed">
                                                "{fb.comment}"
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Your Work + Private Comments ── */}
                <div className="space-y-4 sticky top-6">

                    {/* Your Work Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-semibold text-[#0A1B3C]">Your work</h2>
                            {isLoadingSubmissions ? (
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            ) : isSubmitted ? (
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                                    <CheckCircle className="w-3.5 h-3.5" />
                                    Turned in
                                </span>
                            ) : (
                                <span className="text-xs font-semibold text-orange-500">Assigned</span>
                            )}
                        </div>

                        <div className="p-5 space-y-3">
                            {/* Latest submitted file */}
                            {latestSubmission?.submissionFileName && (
                                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group">
                                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-700 truncate">{latestSubmission.submissionFileName}</p>
                                        <p className="text-xs text-gray-400">Submitted file</p>
                                    </div>
                                    {latestSubmission.submissionFileUrl && (
                                        <a
                                            href={latestSubmission.submissionFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-[#F37022]" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Grade */}
                            {latestSubmission?.grade != null && (
                                <div className="p-3 rounded-xl border border-green-100 bg-green-50 flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Grade</span>
                                    <span className="text-2xl font-bold text-[#F37022]">
                                        {latestSubmission.grade}
                                        <span className="text-sm font-normal text-gray-500">/100</span>
                                    </span>
                                </div>
                            )}

                            {/* Status badge for all submissions */}
                            {mySubmissions.map((sub) => (
                                <div key={sub.id} className="flex items-center justify-between text-xs text-gray-500 px-1">
                                    <span>{new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString()}</span>
                                    <span className={`px-2 py-0.5 font-semibold rounded-full ${AssignmentStatusColor[sub.status]}`}>
                                        {AssignmentStatusLabel[sub.status]}
                                    </span>
                                </div>
                            ))}

                            {/* Action buttons */}
                            <div className="pt-1 space-y-2">
                                {/* Upload / submit progress */}
                                {uploadProgress && (
                                    <div className="flex items-center gap-2 text-[#F37022] text-xs justify-center py-1 animate-pulse">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        {uploadProgress}
                                    </div>
                                )}

                                {/* Success message */}
                                {showSuccess && (
                                    <div className="flex items-center gap-2 text-green-600 text-sm justify-center py-1">
                                        <CheckCircle className="w-4 h-4" />
                                        Submitted successfully!
                                    </div>
                                )}

                                {/* Error message */}
                                {submitError && (
                                    <div className="flex items-center gap-2 text-red-500 text-xs px-1 py-1">
                                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>{submitError}</span>
                                    </div>
                                )}

                                {!isSubmitted ? (
                                    <button
                                        onClick={handleSubmit}
                                        disabled={uploadedFiles.length === 0 || isSubmitting}
                                        className="w-full py-2.5 rounded-xl bg-[#F37022] hover:bg-[#d96419] text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> {uploadProgress ?? 'Turning in...'}</>
                                        ) : (
                                            <><Send className="w-4 h-4" /> Turn in</>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-400 text-sm font-semibold flex items-center justify-center gap-2 cursor-not-allowed opacity-60"
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Unsubmit
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default AssignmentSubmission;
