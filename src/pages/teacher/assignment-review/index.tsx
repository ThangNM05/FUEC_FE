import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/authSlice';
import {
    ChevronRight, ChevronLeft, Save, User, Calendar,
    ExternalLink, Loader2, AlertCircle, FileText, CheckCircle,
    ClipboardCheck, Edit2, Trash2, X,
} from 'lucide-react';
import { Button as AntButton } from 'antd';
import {
    useGetStudentAssignmentByIdQuery,
    useUpdateStudentAssignmentMutation,
} from '@/api/studentAssignmentsApi';
import {
    useGetAssignmentFeedbacksQuery,
    useCreateAssignmentFeedbackMutation,
    useUpdateAssignmentFeedbackMutation,
    useDeleteAssignmentFeedbackMutation,
} from '@/api/assignmentFeedbacksApi';
import { AssignmentStatusLabel, AssignmentStatusColor } from '@/types/assignment.types';

function TeacherAssignmentReview() {
    const navigate = useNavigate();
    const { submissionId } = useParams<{ submissionId: string }>();

    const [score, setScore] = useState<number | ''>('');
    const [feedback, setFeedback] = useState('');
    const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const user = useSelector(selectCurrentUser);
    const teacherId = user?.entityId;

    // ── Fetch data ──
    const {
        data: submission,
        isLoading,
        isError,
    } = useGetStudentAssignmentByIdQuery(submissionId!, { skip: !submissionId });

    const { data: feedbackList } = useGetAssignmentFeedbacksQuery(submissionId!, { skip: !submissionId });

    // ── Mutations ──
    const [updateSubmission, { isLoading: isSavingAssignment }] = useUpdateStudentAssignmentMutation();
    const [createFeedback, { isLoading: isSavingFeedback }] = useCreateAssignmentFeedbackMutation();
    const [updateFeedback, { isLoading: isUpdatingFeedback }] = useUpdateAssignmentFeedbackMutation();
    const [deleteFeedback] = useDeleteAssignmentFeedbackMutation();

    const isSaving = isSavingAssignment || isSavingFeedback || isUpdatingFeedback;

    // ── Side Effects: Populate state ──
    useEffect(() => {
        if (submission?.grade !== undefined && submission.grade !== null) {
            setScore(submission.grade);
        }
    }, [submission]);

    // ── Handlers ──
    const handleSaveGrade = async () => {
        if (score === '' || score === undefined) return;
        if (!submissionId || !teacherId) {
            setSaveError(!teacherId ? 'Teacher profile not found. Please log in again.' : 'Submission error.');
            return;
        }

        setSaveError(null);
        try {
            // 1. Update StudentAssignment (Grade & Status)
            await updateSubmission({
                id: submissionId,
                grade: Number(score),
                status: 2, // Graded
            }).unwrap();

            // 2. Create/Update Feedback
            if (feedback.trim()) {
                if (editingFeedbackId) {
                    await updateFeedback({
                        id: editingFeedbackId,
                        comment: feedback.trim(),
                        grade: Number(score),
                    }).unwrap();
                    setEditingFeedbackId(null);
                } else {
                    await createFeedback({
                        studentAssignmentId: submissionId,
                        teacherId: teacherId,
                        comment: feedback.trim(),
                        grade: Number(score),
                    }).unwrap();
                }
                setFeedback(''); // Clear input after successful save
            }

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (err: any) {
            console.error('Save grade failed:', err);
            setSaveError(err?.data?.message || 'Failed to save grade. Please try again.');
        }
    };

    const handleEditFeedback = (fb: any) => {
        setEditingFeedbackId(fb.id);
        setFeedback(fb.comment);
        setScore(fb.grade || '');
        // Scroll to grading panel
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingFeedbackId(null);
        setFeedback('');
        if (submission?.grade !== undefined && submission.grade !== null) {
            setScore(submission.grade);
        } else {
            setScore('');
        }
    };

    const handleDeleteFeedback = async (id: string) => {
        if (confirm('Are you sure you want to permanently delete this feedback? Any score associated with it will still remain on the assignment until updated.')) {
            try {
                await deleteFeedback(id).unwrap();
            } catch (err: any) {
                console.error('Failed to delete feedback:', err);
                alert('Failed to delete feedback: ' + (err?.data?.message || 'Unknown error'));
            }
        }
    };

    // ── Loading ──
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#F37022]" />
                <p className="text-gray-500 text-sm">Loading submission...</p>
            </div>
        );
    }

    // ── Error ──
    if (isError || !submission) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <p className="text-gray-600 font-medium">Submission not found.</p>
                <button onClick={() => navigate(-1)} className="text-sm text-[#F37022] hover:underline">
                    Go back
                </button>
            </div>
        );
    }

    const submittedAt = new Date(submission.createdAt);
    const currentGrade = submission.grade;

    return (
        <div className="p-4 md:p-6 animate-fadeIn">

            {/* ── Breadcrumb ── */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-5">
                <button onClick={() => navigate('/teacher')} className="hover:text-[#F37022] transition-colors">
                    Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => navigate(-1)} className="hover:text-[#F37022] transition-colors">
                    Submissions
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">Review Submission</span>
            </div>

            {/* ── Student Info Header ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F37022] to-[#f5a623] flex items-center justify-center flex-shrink-0 text-white text-lg font-bold">
                            {submission.studentName?.charAt(0) ?? <User className="w-6 h-6" />}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-[#0A1B3C]">
                                {submission.studentName ?? `Student #${submission.studentId.slice(0, 8)}`}
                            </h1>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                                {submission.studentCode && (
                                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                                        {submission.studentCode}
                                    </span>
                                )}
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Submitted: {submittedAt.toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    })}
                                </span>
                                <span
                                    className={`px-2 py-0.5 rounded-full font-semibold ${AssignmentStatusColor[submission.status]}`}
                                >
                                    {AssignmentStatusLabel[submission.status]}
                                </span>
                                {currentGrade != null && (
                                    <span className="font-semibold text-[#F37022]">
                                        Grade: {currentGrade}/100
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Prev/Next navigation */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to list
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Main Layout ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ── LEFT: Submitted File ── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Submitted File Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                            <ClipboardCheck className="w-5 h-5 text-[#F37022]" />
                            <h2 className="font-semibold text-[#0A1B3C]">Submitted Work</h2>
                        </div>

                        <div className="p-6">
                            {submission.submissionFileName ? (
                                <div className="space-y-4">
                                    {/* File item */}
                                    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">
                                                {submission.submissionFileName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Uploaded {submittedAt.toLocaleDateString()}
                                            </p>
                                        </div>
                                        {/* Open / Download */}
                                        {submission.submissionFileUrl ? (
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={submission.submissionFileUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    Open
                                                </a>
                                                <button
                                                    onClick={async () => {
                                                        if (!submission.submissionFileUrl) return;
                                                        try {
                                                            const response = await fetch(submission.submissionFileUrl);
                                                            const blob = await response.blob();
                                                            const url = window.URL.createObjectURL(blob);

                                                            const ext = submission.submissionFileName?.split('.').pop() || '';
                                                            const newFileName = submission.studentCode ? `${submission.studentCode}.${ext}` : (submission.submissionFileName || 'download');

                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.download = newFileName;
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            document.body.removeChild(link);
                                                            window.URL.revokeObjectURL(url);
                                                        } catch (error) {
                                                            console.error('Download failed, falling back to open:', error);
                                                            window.open(submission.submissionFileUrl, '_blank');
                                                        }
                                                    }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#0A1B3C] rounded-lg hover:bg-[#1a2d5a] transition-colors"
                                                >
                                                    Download
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">No preview URL</span>
                                        )}
                                    </div>

                                    {/* Inline preview for images */}
                                    {submission.submissionFileUrl && (
                                        (() => {
                                            const ext = submission.submissionFileName?.split('.').pop()?.toLowerCase();
                                            const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext ?? '');
                                            const isPdf = ext === 'pdf';

                                            if (isImage) {
                                                return (
                                                    <div className="rounded-xl overflow-hidden border border-gray-100">
                                                        <img
                                                            src={submission.submissionFileUrl}
                                                            alt={submission.submissionFileName}
                                                            className="w-full object-contain max-h-[500px] bg-gray-50"
                                                        />
                                                    </div>
                                                );
                                            }
                                            if (isPdf) {
                                                return (
                                                    <div className="rounded-xl overflow-hidden border border-gray-100">
                                                        <iframe
                                                            src={submission.submissionFileUrl}
                                                            title={submission.submissionFileName}
                                                            className="w-full h-[600px]"
                                                        />
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p className="text-sm font-medium">No file submitted</p>
                                    <p className="text-xs mt-1">The student has not uploaded any files yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assignment description (if available) */}
                    {submission.assignmentDescription && (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
                            <h3 className="font-semibold text-[#0A1B3C] mb-2 text-sm">Assignment Instructions</h3>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {submission.assignmentDescription}
                            </p>
                        </div>
                    )}

                    {/* Feedback History Card */}
                    {feedbackList && feedbackList.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <h3 className="font-bold text-[#0A1B3C] text-sm flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                Feedback History
                            </h3>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
                                {feedbackList.map((fb, idx) => (
                                    <div key={fb.id || idx} className="flex gap-4 items-start border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#F37022] font-bold text-xs flex-shrink-0">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs font-bold text-[#0A1B3C]">
                                                        Instructor Feedback
                                                    </span>
                                                    {fb.grade !== null && (
                                                        <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold border border-orange-100">
                                                            Score: {fb.grade}/100
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                                                        {new Date(fb.createdAt).toLocaleString()}
                                                    </span>
                                                    <div className="flex items-center gap-1 ml-1">
                                                        <button
                                                            onClick={() => handleEditFeedback(fb)}
                                                            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                            title="Edit feedback"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFeedback(fb.id)}
                                                            className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                            title="Delete feedback"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-50 italic">
                                                "{fb.comment}"
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: Grading Panel ── */}
                <div className="sticky top-6 space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                        <h3 className="font-bold text-[#0A1B3C] text-base flex items-center gap-2">
                            <Save className="w-4 h-4 text-[#F37022]" />
                            Grading
                        </h3>

                        {/* Current grade display (if already graded) */}
                        {currentGrade != null && (
                            <div className="p-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between">
                                <span className="text-sm text-gray-600">Current grade</span>
                                <span className="text-2xl font-bold text-[#F37022]">
                                    {currentGrade}
                                    <span className="text-sm font-normal text-gray-500">/100</span>
                                </span>
                            </div>
                        )}

                        {/* Score Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Score (out of 100)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={score}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setScore(val === '' ? '' : Math.min(100, Math.max(0, Number(val))));
                                }}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-[#F37022] focus:ring-2 focus:ring-orange-100 outline-none text-lg font-semibold text-center"
                                placeholder="0 – 100"
                            />
                        </div>

                        {/* Feedback */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    {editingFeedbackId ? 'Update Feedback & Comments' : 'Feedback & Comments'}
                                </label>
                                {editingFeedbackId && (
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-xs text-blue-500 hover:text-blue-700 font-medium flex items-center gap-1"
                                    >
                                        <X className="w-3 h-3" /> Cancel Edit
                                    </button>
                                )}
                            </div>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-[#F37022] focus:ring-2 focus:ring-orange-100 outline-none resize-none text-sm"
                                rows={5}
                                placeholder="Provide detailed feedback for the student..."
                            />
                        </div>

                        {/* Status messages */}
                        {saveSuccess && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                Grade saved successfully!
                            </div>
                        )}
                        {saveError && (
                            <div className="flex items-start gap-2 text-red-500 text-xs">
                                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                <span>{saveError}</span>
                            </div>
                        )}

                        {/* Save Button */}
                        <AntButton
                            type="primary"
                            onClick={handleSaveGrade}
                            loading={isSaving}
                            disabled={score === ''}
                            className={`w-full h-11 flex items-center justify-center gap-2 ${editingFeedbackId ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#F37022] hover:bg-[#D96419]'
                                } border-none text-white font-semibold rounded-xl transition-all`}
                            icon={!isSaving && <Save className="w-4 h-4" />}
                        >
                            {isSaving ? 'Saving...' : editingFeedbackId ? 'Update Feedback' : 'Save Grade'}
                        </AntButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherAssignmentReview;
