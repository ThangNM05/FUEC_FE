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
import {
    useGetStudentAssignmentsByAssignmentIdQuery,
    useSubmitAssignmentMutation,
    useDeleteStudentAssignmentMutation
} from '@/api/studentAssignmentsApi';
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
    const [uploadProgress, setUploadProgress] = useState<string | null>(null);
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const [showUnsubmitConfirm, setShowUnsubmitConfirm] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    // Fetch assignment data from API
    const {
        data: assignment,
        isLoading: isLoadingAssignment,
        isError: isAssignmentError,
    } = useGetAssignmentByIdQuery(id!, { skip: !id });

    const now = new Date();
    const dueDate = assignment?.dueDate ? new Date(assignment.dueDate) : null;
    const isBeforeDeadline = !dueDate || now < dueDate;

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
    const [deleteStudentAssignment, { isLoading: isUnsubmitting }] = useDeleteStudentAssignmentMutation();

    const canUnsubmit = isSubmitted && isBeforeDeadline && latestSubmission?.grade === null;

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
        setShowSubmitConfirm(false);
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

    const handleUnsubmit = async () => {
        if (!latestSubmission) return;
        setSubmitError(null);
        try {
            await deleteStudentAssignment(latestSubmission.id).unwrap();
            setShowUnsubmitConfirm(false);
            setUploadedFiles([]);
            setFileTree([]);
        } catch (err: any) {
            console.error('Unsubmit failed:', err);
            setSubmitError('Failed to unsubmit assignment. Please try again.');
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

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ── LEFT: Your Work Area ── */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden transition-all hover:shadow-lg animate-slideIn">
                        <div className={`px-6 py-5 border-b flex items-center justify-between ${latestSubmission?.grade !== null ? 'bg-green-50/50 border-green-100' : 'bg-gray-50/50 border-gray-100'}`}>
                            <div className="flex items-center gap-2">
                                <Send className="w-5 h-5 text-[#F37022]" />
                                <h2 className="font-bold text-xl text-[#0A1B3C]">Your work</h2>
                            </div>
                            {isLoadingSubmissions ? (
                                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                            ) : isSubmitted ? (
                                <div className="flex flex-col items-end">
                                    <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                        Turned in
                                    </span>
                                    {latestSubmission.status === 3 && (
                                        <span className="text-xs font-bold text-red-500">Late</span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm font-bold text-[#F37022] bg-orange-50 px-3 py-1 rounded-full border border-orange-100 uppercase tracking-wide">Assigned</span>
                            )}
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Latest submitted file */}
                            {latestSubmission?.submissionFileName && (
                                <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors group">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <FileText className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-bold text-gray-700 truncate">{latestSubmission.submissionFileName}</p>
                                        <p className="text-xs text-gray-400">Submitted file</p>
                                    </div>
                                    {latestSubmission.submissionFileUrl && (
                                        <a
                                            href={latestSubmission.submissionFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 hover:bg-white rounded-lg transition-all shadow-sm group-hover:opacity-100 opacity-0 md:opacity-100"
                                        >
                                            <ExternalLink className="w-5 h-5 text-gray-400 hover:text-[#F37022]" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Grade */}
                            {latestSubmission?.grade != null && (
                                <div className="p-6 rounded-2xl border border-green-100 bg-green-50/50 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <span className="text-sm font-bold text-green-700 uppercase tracking-widest">Grade</span>
                                        <p className="text-xs text-green-600/70">Score achieved for this assignment</p>
                                    </div>
                                    <span className="text-4xl font-black text-[#F37022]">
                                        {latestSubmission.grade}
                                        <span className="text-lg font-normal text-gray-400 ml-1">/ 10</span>
                                    </span>
                                </div>
                            )}

                            {/* Submission status for all history */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Submission History</h3>
                                <div className="space-y-2">
                                    {mySubmissions.map((sub) => (
                                        <div key={sub.id} className="flex items-center justify-between text-xs text-gray-500 px-3 py-2 bg-gray-50/50 rounded-lg border border-gray-50">
                                            <span>{new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString()}</span>
                                            <span className={`px-2.5 py-1 font-bold rounded-full text-[10px] ${AssignmentStatusColor[sub.status]}`}>
                                                {AssignmentStatusLabel[sub.status]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="pt-4 space-y-4 w-full px-4">
                                {!isSubmitted && (
                                    <>
                                        <FileUploader onFilesChange={handleFilesChange} isCompact />
                                        {fileTree.length > 0 && (
                                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Structure Preview</h3>
                                                <FileTreeView files={fileTree} />
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Progress / Success / Error Messages */}
                                <div className="space-y-2">
                                    {uploadProgress && (
                                        <div className="flex items-center gap-2 text-[#F37022] text-sm justify-center py-2 animate-pulse font-bold">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            {uploadProgress}
                                        </div>
                                    )}
                                    {showSuccess && (
                                        <div className="flex items-center gap-2 text-green-600 text-sm justify-center py-2 font-bold animate-fadeIn">
                                            <CheckCircle className="w-5 h-5" />
                                            Submitted successfully!
                                        </div>
                                    )}
                                    {submitError && (
                                        <div className="flex items-center gap-2 text-red-500 text-sm px-4 py-3 bg-red-50 rounded-xl border border-red-100 animate-slideIn">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <span className="font-semibold">{submitError}</span>
                                        </div>
                                    )}
                                </div>

                                {!isSubmitted ? (
                                    <button
                                        onClick={() => setShowSubmitConfirm(true)}
                                        disabled={uploadedFiles.length === 0 || isSubmitting}
                                        className="w-full py-4 rounded-xl bg-[#F37022] hover:bg-[#d96419] text-white text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-xl shadow-orange-100 hover:shadow-orange-200 active:scale-[0.98]"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                                        ) : (
                                            <><Send className="w-5 h-5" /> Turn in assignment</>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <button
                                            onClick={() => setShowUnsubmitConfirm(true)}
                                            disabled={!canUnsubmit || isUnsubmitting}
                                            className={`w-full py-4 rounded-xl border-2 text-base font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${canUnsubmit
                                                ? 'border-[#F37022] text-[#F37022] hover:bg-orange-50 cursor-pointer shadow-sm hover:shadow-md'
                                                : 'border-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                                                }`}
                                        >
                                            {isUnsubmitting ? (
                                                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                            ) : (
                                                <><RotateCcw className="w-5 h-5" /> Unsubmit assignment</>
                                            )}
                                        </button>
                                        {!canUnsubmit && isSubmitted && (
                                            <p className="text-[10px] text-center text-gray-400 flex items-center justify-center gap-1.5 px-6">
                                                <Lock className="w-3 h-3" />
                                                This assignment cannot be unsubmitted because it was already graded or the deadline has passed.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: Sidebar (Feedback + Materials) ── */}
                <div className="space-y-4 sticky top-6">
                    {/* Instructor Feedback History */}
                    {feedbacks && feedbacks.length > 0 && (
                        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden animate-slideIn">
                            <div className="px-5 py-3 border-b border-orange-50 bg-orange-50/30">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-[#F37022]" />
                                    <h2 className="font-bold text-sm text-[#0A1B3C]">Feedback History</h2>
                                </div>
                            </div>
                            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                                {feedbacks.slice().reverse().map((fb, idx) => (
                                    <div key={fb.id || idx} className="space-y-2 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-[#0A1B3C] flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                                    {fb.teacherName?.charAt(0) ?? 'T'}
                                                </div>
                                                <p className="text-s font-bold text-[#0A1B3C]">
                                                    {fb.teacherName ?? 'Instructor'}
                                                </p>
                                            </div>
                                            <p className="text-[14px] text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 italic text-gray-700 text-[15px] border border-gray-100">
                                            {fb.grade !== null && (
                                                <div className="mb-1 text-[14px] font-bold text-[#F37022]">Grade: {fb.grade}/10</div>
                                            )}
                                            "{fb.comment}"
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reference Material */}
                    {assignment.fileName && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 transition-all hover:shadow-md">
                            <h3 className="text-sm font-bold text-[#0A1B3C] flex items-center gap-2 px-1">
                                <FileText className="w-4 h-4 text-[#F37022]" />
                                Reference Material
                            </h3>
                            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-all group">
                                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-[#F37022]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-[#0A1B3C] truncate">{assignment.fileName}</p>
                                    <p className="text-[9px] text-gray-400 font-medium tracking-tight">Assignment Guide</p>
                                </div>
                                {assignment.fileUrl && (
                                    <a
                                        href={assignment.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-1.5 hover:bg-white rounded-lg transition-all shadow-sm"
                                        title="Download/View File"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 hover:text-[#F37022]" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="w-8 h-8 text-[#F37022]" />
                            </div>
                            <h2 className="text-xl font-bold text-[#0A1B3C] mb-2">Ready to turn in?</h2>
                            <p className="text-gray-600">
                                You are about to submit your assignment. You can unsubmit and change your files anytime before the deadline.
                            </p>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button
                                onClick={() => setShowSubmitConfirm(false)}
                                className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex-1 py-4 text-sm font-bold text-[#F37022] hover:bg-orange-50 transition-colors"
                            >
                                Turn in
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUnsubmitConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <RotateCcw className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-[#0A1B3C] mb-2">Unsubmit assignment?</h2>
                            <p className="text-gray-600">
                                Unsubmit to add or change attachments. Don't forget to resubmit once you're done.
                                {latestSubmission?.grade !== null && (
                                    <span className="block mt-2 font-bold text-red-500">
                                        Warning: This assignment has already been graded.
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="flex border-t border-gray-100">
                            <button
                                onClick={() => setShowUnsubmitConfirm(false)}
                                className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors border-r border-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUnsubmit}
                                className="flex-1 py-4 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                            >
                                Unsubmit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssignmentSubmission;
