import { useState } from 'react';
import { AlertTriangle, Calendar, Clock, FileVideo, Image as ImageIcon, Eye, Download } from 'lucide-react';

interface ProctoringReport {
    id: number;
    studentName: string;
    studentCode: string;
    examName: string;
    examCode: string;
    suspiciousActivity: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
    duration: string;
    attachments: {
        type: 'image' | 'video';
        url: string;
        thumbnail?: string;
        timestamp: string;
    }[];
    description: string;
}

function TeacherReports() {
    const [semester, setSemester] = useState('SPRING2025');
    const [filterSeverity, setFilterSeverity] = useState<'all' | 'high' | 'medium' | 'low'>('all');

    const proctoringReports: ProctoringReport[] = [
        {
            id: 1,
            studentName: 'Nguyen Van A',
            studentCode: 'SE140001',
            examName: 'Database Systems Midterm',
            examCode: 'DBS202',
            suspiciousActivity: 'Multiple face detection',
            severity: 'high',
            timestamp: '2024-05-15 14:23:45',
            duration: '3 minutes',
            attachments: [
                { type: 'image', url: '/evidence/face1.jpg', timestamp: '14:23:45' },
                { type: 'image', url: '/evidence/face2.jpg', timestamp: '14:24:12' },
                { type: 'image', url: '/evidence/face3.jpg', timestamp: '14:25:30' },
                { type: 'video', url: '/evidence/session1.mp4', thumbnail: '/evidence/video1-thumb.jpg', timestamp: '14:23:00' }
            ],
            description: 'System detected multiple different faces during the exam session. Student may have had unauthorized assistance.'
        },
        {
            id: 2,
            studentName: 'Tran Thi B',
            studentCode: 'SE140002',
            examName: 'Web Development Final',
            examCode: 'WEB301',
            suspiciousActivity: 'Tab switching detected',
            severity: 'medium',
            timestamp: '2024-05-14 10:15:22',
            duration: '45 seconds',
            attachments: [
                { type: 'image', url: '/evidence/screen1.jpg', timestamp: '10:15:22' },
                { type: 'image', url: '/evidence/screen2.jpg', timestamp: '10:15:45' },
                { type: 'video', url: '/evidence/session2.mp4', thumbnail: '/evidence/video2-thumb.jpg', timestamp: '10:15:00' }
            ],
            description: 'Student switched browser tabs 5 times during question 3. Screen captures show external resources being accessed.'
        },
        {
            id: 3,
            studentName: 'Le Van C',
            studentCode: 'SE140003',
            examName: 'Data Structures Quiz',
            examCode: 'DSA201',
            suspiciousActivity: 'No face detected',
            severity: 'high',
            timestamp: '2024-05-13 15:42:18',
            duration: '8 minutes',
            attachments: [
                { type: 'image', url: '/evidence/noface1.jpg', timestamp: '15:42:18' },
                { type: 'image', url: '/evidence/noface2.jpg', timestamp: '15:45:30' },
                { type: 'image', url: '/evidence/noface3.jpg', timestamp: '15:48:12' }
            ],
            description: 'Camera feed showed empty seat for extended period. Student may have left the exam area without permission.'
        },
        {
            id: 4,
            studentName: 'Pham Thi D',
            studentCode: 'SE140004',
            examName: 'Algorithm Analysis Test',
            examCode: 'ALG301',
            suspiciousActivity: 'Suspicious eye movement',
            severity: 'low',
            timestamp: '2024-05-12 09:20:33',
            duration: '2 minutes',
            attachments: [
                { type: 'image', url: '/evidence/eyes1.jpg', timestamp: '09:20:33' },
                { type: 'image', url: '/evidence/eyes2.jpg', timestamp: '09:21:15' },
                { type: 'video', url: '/evidence/session3.mp4', thumbnail: '/evidence/video3-thumb.jpg', timestamp: '09:20:00' }
            ],
            description: 'Eye tracking detected prolonged looking away from screen, possibly reading external materials.'
        }
    ];

    const filteredReports = proctoringReports.filter(report => {
        if (filterSeverity === 'all') return true;
        return report.severity === filterSeverity;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-700 border-red-300';
            case 'medium': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'low': return 'bg-blue-100 text-blue-700 border-blue-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const getSeverityBadgeColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-orange-500';
            case 'low': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Proctoring Reports</h1>
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-[#0A1B3C] focus:border-[#F37022] outline-none"
                    >
                        <option value="SPRING2025">Spring 2025</option>
                        <option value="FALL2024">Fall 2024</option>
                        <option value="SUMMER2024">Summer 2024</option>
                    </select>
                </div>

                <button className="px-4 py-2 bg-white border border-gray-300 text-[#0A1B3C] font-medium text-sm rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export All Reports
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
                <button
                    onClick={() => setFilterSeverity('all')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filterSeverity === 'all'
                        ? 'border-[#F37022] text-[#F37022]'
                        : 'border-transparent text-gray-600 hover:text-[#0A1B3C]'
                        }`}
                >
                    All ({proctoringReports.length})
                </button>
                <button
                    onClick={() => setFilterSeverity('high')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filterSeverity === 'high'
                        ? 'border-[#F37022] text-[#F37022]'
                        : 'border-transparent text-gray-600 hover:text-[#0A1B3C]'
                        }`}
                >
                    High Severity ({proctoringReports.filter(r => r.severity === 'high').length})
                </button>
                <button
                    onClick={() => setFilterSeverity('medium')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filterSeverity === 'medium'
                        ? 'border-[#F37022] text-[#F37022]'
                        : 'border-transparent text-gray-600 hover:text-[#0A1B3C]'
                        }`}
                >
                    Medium Severity ({proctoringReports.filter(r => r.severity === 'medium').length})
                </button>
                <button
                    onClick={() => setFilterSeverity('low')}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${filterSeverity === 'low'
                        ? 'border-[#F37022] text-[#F37022]'
                        : 'border-transparent text-gray-600 hover:text-[#0A1B3C]'
                        }`}
                >
                    Low Severity ({proctoringReports.filter(r => r.severity === 'low').length})
                </button>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {filteredReports.map(report => (
                    <div key={report.id} className={`bg-white rounded-xl border-2 p-5 ${getSeverityColor(report.severity)}`}>
                        {/* Report Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`w-3 h-3 rounded-full ${getSeverityBadgeColor(report.severity)}`}></span>
                                    <h3 className="font-bold text-[#0A1B3C] text-lg">{report.suspiciousActivity}</h3>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}>
                                        {report.severity.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-[#0A1B3C]">{report.studentName}</span>
                                        <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">
                                            {report.studentCode}
                                        </span>
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded">
                                            {report.examCode}
                                        </span>
                                        <span>{report.examName}</span>
                                    </div>
                                </div>
                            </div>
                            <AlertTriangle className={`w-6 h-6 ${report.severity === 'high' ? 'text-red-500' :
                                report.severity === 'medium' ? 'text-orange-500' :
                                    'text-blue-500'
                                }`} />
                        </div>

                        {/* Timestamp & Duration */}
                        <div className="flex items-center gap-6 mb-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(report.timestamp).toLocaleDateString('en-US', {
                                    month: 'short', day: 'numeric', year: 'numeric'
                                })}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(report.timestamp).toLocaleTimeString('en-US', {
                                    hour: '2-digit', minute: '2-digit', second: '2-digit'
                                })}</span>
                            </div>
                            <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                Duration: {report.duration}
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-700 mb-4 bg-white/50 p-3 rounded-lg">
                            {report.description}
                        </p>

                        {/* Attachments */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Eye className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700">
                                    Evidence ({report.attachments.length} files)
                                </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {report.attachments.map((attachment, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#F37022] transition-colors cursor-pointer">
                                            {attachment.type === 'image' ? (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
                                                    <ImageIcon className="w-8 h-8 text-blue-400" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
                                                    <FileVideo className="w-8 h-8 text-purple-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute top-1 right-1">
                                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${attachment.type === 'image'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-purple-500 text-white'
                                                }`}>
                                                {attachment.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="mt-1 text-xs text-gray-500 font-mono text-center">
                                            {attachment.timestamp}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                            <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Confirm Cheating
                            </button>
                            <button className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600">
                                Dismiss
                            </button>
                            <button className="ml-auto px-4 py-2 bg-white border border-gray-300 text-[#0A1B3C] text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                <Eye className="w-4 h-4" />
                                Review Evidence
                            </button>
                            <button className="px-4 py-2 bg-white border border-gray-300 text-[#0A1B3C] text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredReports.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                </div>
            )}
        </div>
    );
}

export default TeacherReports;
