import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronRight, ChevronLeft, Save, CheckCircle, XCircle, User, Calendar, Download } from 'lucide-react';
import FileTreeView from '@/components/FileTreeView';
import FilePreview from '@/components/FilePreview';

interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'folder';
    size?: number;
    children?: FileNode[];
    file?: File; // Actual file for preview
}

function TeacherAssignmentReview() {
    const navigate = useNavigate();
    const { submissionId } = useParams();
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
    const [score, setScore] = useState<number | undefined>();
    const [feedback, setFeedback] = useState('');
    const [passed, setPassed] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Mock submission with files 
    const submission = {
        id: submissionId || '1',
        studentId: 'ST001',
        studentName: 'Trương Nguyễn Tiến Đạt',
        submittedAt: new Date('2025-12-01T14:30:00'),
        fileCount: 12,
        status: 'pending' as const,
    };

    const assignment = {
        title: 'Mobile App Project - Final Submission',
        maxScore: 100,
    };

    // Mock file tree with actual File objects for preview
    const createMockFile = (name: string, content: string, type: string): File => {
        return new File([content], name, { type });
    };

    const [fileTree] = useState<FileNode[]>([
        {
            name: 'my-app',
            path: 'my-app',
            type: 'folder',
            children: [
                {
                    name: 'src',
                    path: 'my-app/src',
                    type: 'folder',
                    children: [
                        {
                            name: 'App.js',
                            path: 'my-app/src/App.js',
                            type: 'file',
                            size: 2500,
                            file: createMockFile(
                                'App.js',
                                `import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>My Mobile App</h1>\n      <p>Welcome to the app!</p>\n    </div>\n  );\n}\n\nexport default App;`,
                                'text/javascript'
                            ),
                        },
                        {
                            name: 'index.css',
                            path: 'my-app/src/index.css',
                            type: 'file',
                            size: 1200,
                            file: createMockFile(
                                'index.css',
                                `body {\n  margin: 0;\n  font-family: Arial, sans-serif;\n}\n\n.App {\n  text-align: center;\n  padding: 20px;\n}`,
                                'text/css'
                            ),
                        },
                    ],
                },
                {
                    name: 'README.md',
                    path: 'my-app/README.md',
                    type: 'file',
                    size: 800,
                    file: createMockFile(
                        'README.md',
                        `# My Mobile App\n\nA simple mobile application project.\n\n## Features\n- User authentication\n- Data management\n- Responsive UI`,
                        'text/markdown'
                    ),
                },
                {
                    name: 'screenshot.png',
                    path: 'my-app/screenshot.png',
                    type: 'file',
                    size: 45000,
                    file: createMockFile('screenshot.png', '', 'image/png'),
                },
            ],
        },
    ]);

    const handleFileClick = (file: FileNode) => {
        if (file.type === 'file' && file.file) {
            setSelectedFile(file);
        }
    };

    const handleSaveGrade = async () => {
        if (score === undefined) {
            alert('Please enter a score');
            return;
        }

        setIsSaving(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSaving(false);
        alert('Grade saved successfully!');
    };

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <button onClick={() => navigate('/teacher')} className="hover:text-[#F37022] transition-colors">
                    Home
                </button>
                <ChevronRight className="w-4 h-4" />
                <button onClick={() => navigate('/teacher/assignments')} className="hover:text-[#F37022] transition-colors">
                    Assignments
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-[#0A1B3C] font-medium">Review Submission</span>
            </div>

            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-[#0A1B3C]">{submission.studentName}</h1>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                    <span>Student ID: {submission.studentId}</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" />
                                        Submitted: {submission.submittedAt.toLocaleString()}
                                    </span>
                                    <span>{submission.fileCount} files</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => console.log('Previous')}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Previous student"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => console.log('Next')}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Next student"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* File Tree */}
                <div className="lg:col-span-3">
                    <FileTreeView files={fileTree} onFileClick={handleFileClick} selectedPath={selectedFile?.path} />
                </div>

                {/* File Preview */}
                <div className="lg:col-span-6">
                    <div className="bg-white rounded-xl border border-gray-200 h-[600px] overflow-hidden">
                        {selectedFile && selectedFile.file ? (
                            <FilePreview file={selectedFile.file} filename={selectedFile.name} />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <p className="font-medium">Select a file to preview</p>
                                    <p className="text-sm mt-1">Click on any file in the tree to view its content</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Grading Panel */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-6 space-y-6">
                        <h3 className="font-bold text-[#0A1B3C] text-lg">Grading</h3>

                        {/* Score Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Score (out of {assignment.maxScore})</label>
                            <input
                                type="number"
                                min="0"
                                max={assignment.maxScore}
                                value={score || ''}
                                onChange={(e) => setScore(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-[#F37022] focus:ring-2 focus:ring-orange-100 outline-none"
                                placeholder="Enter score"
                            />
                        </div>

                        {/* Feedback */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Feedback & Comments</label>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[#F37022] focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                                rows={6}
                                placeholder="Provide detailed feedback..."
                            />
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSaveGrade}
                            disabled={isSaving || score === undefined}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#F37022] text-white font-semibold rounded-lg hover:bg-[#D96419] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Grade
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TeacherAssignmentReview;
