import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronRight, Calendar, Clock, Send, CheckCircle, History, FileText } from 'lucide-react';
import { Button as AntButton } from 'antd';
import FileUploader from '@/components/FileUploader';
import FileTreeView from '@/components/FileTreeView';

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

interface Submission {
    id: string;
    fileCount: number;
    submittedAt: Date;
    score?: number;
    feedback?: string;
    status: 'pending' | 'graded';
}

function AssignmentSubmission() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [fileTree, setFileTree] = useState<FileNode[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Mock assignment data
    const assignment = {
        id: '1',
        title: 'Mobile App Project - Final Submission',
        courseCode: 'PRN212',
        courseName: 'Mobile Programming',
        instructions: `
Submit your complete mobile app project with all source code, documentation, and assets.

Required Files:
- Source code (all files, organized in folders)
- README.md with project description
- Screenshots of the app
- Any additional documentation

File Requirements:
- No zip files needed - upload folders directly
- Maximum total size: 100MB
- Supported formats: Code files, images, PDF, documents
    `,
        dueDate: new Date('2025-12-15'),
        maxScore: 100,
    };

    // Mock submission history
    const [submissions, setSubmissions] = useState<Submission[]>([
        {
            id: '1',
            fileCount: 15,
            submittedAt: new Date('2025-11-20T10:30:00'),
            score: 85,
            feedback: 'Good progress, but missing some documentation.',
            status: 'graded',
        },
    ]);

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
                    // It's a file
                    currentLevel.push({
                        name: part,
                        path: currentPath,
                        type: 'file',
                        size: file.size,
                    });
                } else {
                    // It's a folder
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

        setIsSubmitting(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const newSubmission: Submission = {
            id: `sub-${Date.now()}`,
            fileCount: uploadedFiles.length,
            submittedAt: new Date(),
            status: 'pending',
        };

        setSubmissions([newSubmission, ...submissions]);
        setShowSuccess(true);
        setIsSubmitting(false);

        setTimeout(() => {
            setShowSuccess(false);
            setUploadedFiles([]);
            setFileTree([]);
        }, 3000);
    };

    const getDaysRemaining = () => {
        const now = new Date();
        const diff = assignment.dueDate.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days;
    };

    const daysRemaining = getDaysRemaining();

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <button onClick={() => navigate('/student')} className="hover:text-[#F37022] transition-colors">
                    Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <button
                    onClick={() => navigate(`/student/course-details?code=${assignment.courseCode}`)}
                    className="hover:text-[#F37022] transition-colors"
                >
                    {assignment.courseName}
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">Assignment Submission</span>
            </div>

            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C] mb-3">{assignment.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {assignment.dueDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span
                            className={`font-medium ${daysRemaining < 0 ? 'text-red-600' : daysRemaining <= 7 ? 'text-orange-600' : 'text-gray-700'
                                }`}
                        >
                            {daysRemaining < 0 ? 'Overdue' : `${daysRemaining} days remaining`}
                        </span>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                        Max Score: {assignment.maxScore}
                    </span>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-6">
                <h2 className="text-lg font-bold text-[#0A1B3C] mb-3">Instructions</h2>
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{assignment.instructions}</div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Upload Section */}
                <div className="lg:col-span-3 space-y-6">
                    {/* File Uploader */}
                    <FileUploader onFilesChange={handleFilesChange} />

                    {/* File Tree Preview */}
                    {fileTree.length > 0 && (
                        <div>
                            <h3 className="text-lg font-bold text-[#0A1B3C] mb-3">File Structure Preview</h3>
                            <FileTreeView files={fileTree} />
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="flex items-center justify-between pt-4">
                        {showSuccess && (
                            <div className="flex items-center gap-2 text-green-600 animate-slideDown">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-medium">Submitted successfully!</span>
                            </div>
                        )}
                        <div className="flex-1"></div>
                        <AntButton
                            type="primary"
                            onClick={handleSubmit}
                            loading={isSubmitting}
                            disabled={uploadedFiles.length === 0}
                            className="flex items-center gap-2 h-12 px-6 bg-[#F37022] hover:bg-[#D96419] border-none text-white font-semibold rounded-lg transition-all hover-lift"
                            icon={!isSubmitting && <Send className="w-5 h-5" />}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
                        </AntButton>
                    </div>
                </div>

                {/* Submission History Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
                        <h3 className="font-bold text-[#0A1B3C] mb-1 flex items-center gap-2">
                            <History className="w-5 h-5" />
                            Submission History
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">{submissions.length} submission(s)</p>

                        <div className="space-y-3">
                            {submissions.length === 0 ? (
                                <p className="text-xs text-gray-500 text-center py-4">No submissions yet.</p>
                            ) : (
                                submissions.map((submission) => (
                                    <div
                                        key={submission.id}
                                        className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-orange-200 transition-colors"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs text-gray-500">
                                                {submission.submittedAt.toLocaleDateString()} {submission.submittedAt.toLocaleTimeString()}
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 text-xs font-semibold rounded ${submission.status === 'graded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                            >
                                                {submission.status}
                                            </span>
                                        </div>

                                        {submission.score !== undefined && (
                                            <div className="mb-2">
                                                <span className="text-lg font-bold text-[#F37022]">{submission.score}</span>
                                                <span className="text-sm text-gray-600">/{assignment.maxScore}</span>
                                            </div>
                                        )}

                                        {submission.feedback && <p className="text-xs text-gray-700 line-clamp-2 mb-2">{submission.feedback}</p>}

                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <FileText className="w-3 h-3" />
                                            <span>{submission.fileCount} file(s)</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssignmentSubmission;
