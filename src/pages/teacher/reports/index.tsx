import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Select } from 'antd';
import {
    AlertTriangle,
    Calendar,
    Clock,
    Eye,
    Download,
    ChevronRight,
    Users,
    FileText,
    ArrowLeft,
    Search,
    BarChart3,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Award,
    Layers,
    ShieldAlert,
    FileSpreadsheet,
    CheckCircle2,
    ClipboardList,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import dayjs from 'dayjs';
import { useGetAuthTeacherTeachingSubjectsQuery } from '@/api/teachersApi';
import { useGetSemestersQuery, useGetDefaultSemesterQuery, useGetSemesterReportQuery } from '@/api/semestersApi';
import { useGetExamsByClassSubjectIdQuery } from '@/api/examsApi';
import { useGetAllStudentExamsQuery } from '@/api/studentExamsApi';
import { useGetStudentCheatLogsQuery, useDeleteStudentCheatLogMutation, useGetStudentCheatLogByIdQuery } from '@/api/studentCheatLogsApi';
import { useUpdateStudentExamMutation, useGetStudentExamByIdQuery } from '@/api/studentExamsApi';
import { useLazyExportGradesQuery, useLazyExportQuestionReportQuery } from '@/api/classDetailsApi';
import { getApiUrl } from '@/config/appConfig';
import JSZip from 'jszip';

// --- Types ---
interface StudentEvidence {
    id: number;
    studentName: string;
    studentCode: string;
    suspiciousActivity: string;
    severity: 'high' | 'medium' | 'low';
    timestamp: string;
    duration: string;
    attachments: {
        id: string;
        type: 'image' | 'video';
        url: string;
        thumbnail?: string;
        timestamp: string;
    }[];
    description: string;
}

interface ExamReport {
    id: string;
    name: string;
    code: string;
    date: string;
    totalStudents: number;
    flaggedCount: number;
    students: StudentEvidence[];
}

interface ClassSubject {
    id: string;
    className: string;
    subjectCode: string;
    subjectName: string;
    semester: string;
    exams: ExamReport[];
}

// --- Views ---
type ViewState = 'CLASSES' | 'EXAMS' | 'STUDENTS' | 'DETAIL';
type MainTab = 'integrity' | 'academic';

function TeacherReports() {
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<MainTab>('integrity');
    const [view, setView] = useState<ViewState>('CLASSES');
    const [semester, setSemester] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedClass, setSelectedClass] = useState<any | null>(null);
    const [selectedExam, setSelectedExam] = useState<any | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const handledCheatLogIdRef = useRef<string | null>(null);

    const [deleteLog, { isLoading: isDeletingLogs }] = useDeleteStudentCheatLogMutation();
    const [updateStudentExam, { isLoading: isConfirmingCheating }] = useUpdateStudentExamMutation();

    const [confirmModal, setConfirmModal] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDangerous?: boolean;
    }>({ open: false, title: '', message: '', onConfirm: () => { } });

    const openConfirmModal = useCallback((title: string, message: string, onConfirm: () => void, isDangerous = true) => {
        setConfirmModal({ open: true, title, message, onConfirm, isDangerous });
    }, []);

    const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, open: false }));

    const { data: defaultSemester } = useGetDefaultSemesterQuery();
    const { data: semestersData } = useGetSemestersQuery({ page: 1, pageSize: 100 });
    const semestersList = semestersData?.items || [];

    useEffect(() => {
        if (defaultSemester?.id && !semester) {
            setSemester(defaultSemester.id);
        }
    }, [defaultSemester, semester]);

    const { data: teachingData, isLoading: loadingClasses } = useGetAuthTeacherTeachingSubjectsQuery(
        { semesterId: semester },
        { skip: !semester }
    );

    const { data: examsData, isLoading: loadingExams } = useGetExamsByClassSubjectIdQuery(
        selectedClass?.classSubjectId || '',
        { skip: !selectedClass || view !== 'EXAMS' }
    );

    const { data: logsData, isLoading: loadingLogs } = useGetStudentCheatLogsQuery(
        {
            examId: selectedExam?.id,
            semesterId: semester,
            classSubjectId: selectedClass?.classSubjectId
        },
        { skip: !selectedExam || view !== 'STUDENTS' }
    );

    const cheatLogIdFromUrl = searchParams.get('cheatLogId');
    const { data: deepLinkCheatLog } = useGetStudentCheatLogByIdQuery(
        cheatLogIdFromUrl || '',
        { skip: !cheatLogIdFromUrl }
    );

    const { data: deepLinkStudentExam } = useGetStudentExamByIdQuery(
        deepLinkCheatLog?.studentExamId || '',
        { skip: !deepLinkCheatLog?.studentExamId }
    );

    const { data: studentExamsData } = useGetAllStudentExamsQuery(
        { examId: selectedExam?.id },
        { skip: !selectedExam || view !== 'STUDENTS' }
    );

    const flaggedStudents = useMemo(() => {
        if (!logsData?.items) return [];

        const grouped = logsData.items.reduce((acc: any, log: any) => {
            const id = log.studentExamId;
            if (!acc[id]) {
                acc[id] = {
                    id,
                    studentName: log.studentName || 'Student',
                    studentCode: 'Unknown',
                    suspiciousActivity: log.status,
                    severity: 'medium',
                    timestamp: log.timestamp,
                    duration: 'N/A',
                    attachments: [],
                    description: `Captured proctoring log: ${log.status}`
                };

                if (studentExamsData?.items) {
                    const se = studentExamsData.items.find((x: any) => x.studentExamId === id);
                    if (se) {
                        acc[id].studentName = se.studentName || acc[id].studentName;
                        acc[id].studentCode = se.studentCode || acc[id].studentCode;
                        acc[id].grade = se.grade;
                        acc[id].isSubmitted = se.isSubmitted;
                    }
                }
            }
            const attachmentUrl = log.capturedImageUrl;
            const isVideo = typeof attachmentUrl === 'string' && attachmentUrl.toLowerCase().includes('.webm');
            acc[id].attachments.push({
                id: log.id,
                type: isVideo ? 'video' : 'image',
                url: attachmentUrl,
                thumbnail: (log as any).thumbnailUrl || undefined,
                timestamp: dayjs(log.timestamp).format('HH:mm:ss')
            });
            return acc;
        }, {});

        return Object.values(grouped) as StudentEvidence[];
    }, [logsData, studentExamsData]);

    useEffect(() => {
        if (!cheatLogIdFromUrl || !deepLinkCheatLog) return;
        if (handledCheatLogIdRef.current === cheatLogIdFromUrl) return;

        const attachmentUrl = deepLinkCheatLog.capturedImageUrl;
        const isVideo = typeof attachmentUrl === 'string' && attachmentUrl.toLowerCase().includes('.webm');

        setActiveTab('integrity');
        setSelectedExam({
            id: deepLinkStudentExam?.examId || '',
            displayName: deepLinkStudentExam?.examDisplayName || 'Exam'
        });
        setSelectedStudent({
            id: deepLinkCheatLog.studentExamId,
            studentName: deepLinkCheatLog.studentName || deepLinkStudentExam?.studentName || 'Student',
            studentCode: deepLinkStudentExam?.studentCode || 'Unknown',
            suspiciousActivity: deepLinkCheatLog.status,
            severity: 'medium',
            timestamp: deepLinkCheatLog.timestamp,
            duration: 'N/A',
            description: `Captured proctoring log: ${deepLinkCheatLog.status}`,
            attachments: [
                {
                    id: deepLinkCheatLog.id,
                    type: isVideo ? 'video' : 'image',
                    url: attachmentUrl,
                    timestamp: dayjs(deepLinkCheatLog.timestamp).format('HH:mm:ss')
                }
            ],
            grade: deepLinkStudentExam?.grade,
            isSubmitted: deepLinkStudentExam?.isSubmitted
        });
        setView('DETAIL');

        handledCheatLogIdRef.current = cheatLogIdFromUrl;
    }, [cheatLogIdFromUrl, deepLinkCheatLog, deepLinkStudentExam]);

    // --- Helpers ---
    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'high': return 'bg-red-50 text-red-600 border-red-100 ring-red-500';
            case 'medium': return 'bg-orange-50 text-orange-600 border-orange-100 ring-orange-500';
            case 'low': return 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500';
            default: return 'bg-gray-50 text-gray-600 border-gray-100 ring-gray-500';
        }
    };

    const allAvailableClasses = useMemo(() => {
        if (!teachingData?.subjects) return [];

        return teachingData.subjects.flatMap((subject: any) =>
            (subject.classes || []).map((cls: any) => ({
                ...cls,
                subjectId: subject.subjectId,
                subjectCode: subject.subjectCode,
                subjectName: subject.subjectName,
                id: cls.classSubjectId
            }))
        );
    }, [teachingData]);

    const filteredClasses = useMemo(() => {
        return allAvailableClasses.filter((cs: any) => {
            const search = searchTerm.toLowerCase();
            return cs.classCode?.toLowerCase().includes(search) ||
                cs.subjectCode?.toLowerCase().includes(search) ||
                cs.subjectName?.toLowerCase().includes(search);
        });
    }, [allAvailableClasses, searchTerm]);

    const handleBack = () => {
        if (view === 'DETAIL') {
            setView('STUDENTS');
            setSelectedStudent(null);
        } else if (view === 'STUDENTS') {
            setView('EXAMS');
            setSelectedExam(null);
        } else if (view === 'EXAMS') {
            setView('CLASSES');
            setSelectedClass(null);
        }
    };

    const handleConfirmCheating = () => {
        if (!selectedStudent) return;
        openConfirmModal(
            'Confirm Cheating',
            `Are you sure you want to confirm cheating for ${selectedStudent.studentName}? This will set their exam grade to 0. The captured evidence will be preserved for record keeping.`,
            async () => {
                closeConfirmModal();
                try {
                    await updateStudentExam({ id: selectedStudent.id, grade: 0 }).unwrap();

                    toast.success(`Cheating confirmed for ${selectedStudent.studentName}. Grade set to 0.`);
                    setView('STUDENTS');
                    setSelectedStudent(null);
                } catch (error) {
                    console.error('Failed to confirm cheating', error);
                    toast.error('Failed to confirm cheating. Please try again.');
                }
            }
        );
    };

    const handleDismissFalsePositive = () => {
        if (!selectedStudent || !selectedStudent.attachments || selectedStudent.attachments.length === 0) return;
        openConfirmModal(
            'Dismiss False Positive',
            'Are you sure you want to dismiss all evidence for this student? This action cannot be undone and will permanently delete the evidence.',
            async () => {
                closeConfirmModal();
                try {
                    const deletePromises = selectedStudent.attachments.map((attachment: any) =>
                        deleteLog(attachment.id).unwrap()
                    );
                    await Promise.all(deletePromises);
                    toast.success('Evidence dismissed successfully.');
                    setView('STUDENTS');
                    setSelectedStudent(null);
                } catch (error) {
                    console.error('Failed to dismiss cheating logs', error);
                    toast.error('Failed to dismiss false positive. Please try again.');
                }
            }
        );
    };

    const handleDownload = useCallback(async (fileUrl: string, fileName: string) => {
        try {
            let downloadUrl = fileUrl;
            let options: RequestInit = {};

            // For S3 URLs, use backend proxy to avoid CORS issues and force download
            if (fileUrl.includes('amazonaws.com')) {
                const urlObj = new URL(fileUrl);
                const key = decodeURIComponent(urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname);
                downloadUrl = getApiUrl(`/Files/download?key=${encodeURIComponent(key)}`);

                // Add token for proxy endpoint if needed
                const token = localStorage.getItem('token');
                if (token) {
                    options = {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    };
                }
            }

            // Fetch the file through proxy/direct, convert to blob, and use local ObjectURL avoiding tab open
            const response = await fetch(downloadUrl, options);
            if (!response.ok) throw new Error('Download failed from server');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            window.open(fileUrl, '_blank');
        }
    }, []);

    const [isZipping, setIsZipping] = useState(false);

    const handleDownloadAllAsZip = useCallback(async () => {
        if (!selectedStudent || !selectedStudent.attachments || selectedStudent.attachments.length === 0) return;
        
        setIsZipping(true);
        const loadingToast = toast.loading('Bundling files into ZIP...');
        
        try {
            const zip = new JSZip();
            const studentCode = selectedStudent.studentCode || 'student';
            
            // Download all files and add to zip
            const fetchPromises = selectedStudent.attachments.map(async (file: any, idx: number) => {
                const ext = file.type === 'video' ? 'webm' : 'jpg';
                const fileName = `${studentCode}_evidence_${idx + 1}.${ext}`;
                let downloadUrl = file.url;
                let options: RequestInit = {};

                if (file.url.includes('amazonaws.com')) {
                    const urlObj = new URL(file.url);
                    const key = decodeURIComponent(urlObj.pathname.startsWith('/') ? urlObj.pathname.substring(1) : urlObj.pathname);
                    downloadUrl = getApiUrl(`/Files/download?key=${encodeURIComponent(key)}`);
                    const token = localStorage.getItem('token');
                    if (token) options = { headers: { Authorization: `Bearer ${token}` } };
                }

                const response = await fetch(downloadUrl, options);
                if (!response.ok) throw new Error(`Failed to fetch ${fileName}`);
                const blob = await response.blob();
                zip.file(fileName, blob);
            });

            await Promise.all(fetchPromises);
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const zipUrl = window.URL.createObjectURL(zipBlob);
            
            const link = document.createElement('a');
            link.href = zipUrl;
            link.download = `${studentCode}_all_evidence.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(zipUrl);
            
            toast.success('ZIP file downloaded successfully', { id: loadingToast });
        } catch (error) {
            console.error('Failed to create ZIP:', error);
            toast.error('Failed to download all files', { id: loadingToast });
        } finally {
            setIsZipping(false);
        }
    }, [selectedStudent]);

    // --- Breadcrumb Navigation ---
    const Breadcrumbs = () => (
        <nav className="flex items-center gap-2 text-sm mb-6 text-gray-500 px-1 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
            <button
                onClick={() => { setView('CLASSES'); setSelectedClass(null); setSelectedExam(null); setSelectedStudent(null); }}
                className="hover:text-[#F37022] transition-colors font-medium shrink-0"
            >
                Reports
            </button>
            {selectedClass && (
                <>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    <button
                        onClick={() => { setView('EXAMS'); setSelectedExam(null); setSelectedStudent(null); }}
                        className={`hover:text-[#F37022] transition-colors shrink-0 ${view === 'EXAMS' ? 'text-[#0A1B3C] font-semibold' : 'font-medium'}`}
                    >
                        {selectedClass.classCode}
                    </button>
                </>
            )}
            {selectedExam && (
                <>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    <button
                        onClick={() => { setView('STUDENTS'); setSelectedStudent(null); }}
                        className={`hover:text-[#F37022] transition-colors shrink-0 ${view === 'STUDENTS' ? 'text-[#0A1B3C] font-semibold' : 'font-medium'}`}
                    >
                        {selectedExam.displayName || selectedExam.name}
                    </button>
                </>
            )}
            {selectedStudent && (
                <>
                    <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-[#0A1B3C] font-semibold shrink-0">{selectedStudent.studentName}</span>
                </>
            )}
        </nav>
    );

    // --- Components ---
    const ExamCard = ({ exam }: { exam: any }) => {
        const { data: logStats } = useGetStudentCheatLogsQuery(
            {
                examId: exam.id,
                pageSize: 1,
                semesterId: semester,
                classSubjectId: selectedClass?.classSubjectId
            },
            { skip: !exam?.id || !selectedClass }
        );

        const cheatCount = logStats?.totalCount || 0;

        return (
            <motion.div
                whileHover={{ x: 8 }}
                onClick={() => { setSelectedExam(exam); setView('STUDENTS'); }}
                className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white border border-gray-100 rounded-2xl hover:border-[#F37022]/40 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
                <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="p-3 rounded-xl transition-colors bg-blue-50 shrink-0">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-[#0A1B3C] group-hover:text-[#F37022] transition-colors truncate">{exam.displayName || exam.name}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs md:text-sm text-gray-500">
                            <span className="flex items-center gap-1.5 font-mono bg-gray-50 px-2 py-0.5 rounded shrink-0">
                                {exam.tag}
                            </span>
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                                <Calendar className="w-3.5 h-3.5" />
                                {dayjs(exam.startTime).format('MMM DD, YYYY')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-4 md:mt-0 flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
                    <div className="flex items-center gap-4">
                        {cheatCount > 0 && (
                            <div className="flex flex-col items-start md:items-end">
                                <span className="text-[9px] md:text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1 animate-pulse">
                                    Flagged Activity
                                </span>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 shadow-sm">
                                    <AlertTriangle className="w-3 h-3 md:w-3.5 md:h-3.5" />
                                    <span className="font-bold text-[11px] md:text-xs">{cheatCount} logs</span>
                                </div>
                            </div>
                        )}
                        <div className="min-w-[60px] md:min-w-[80px]">
                            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-left md:text-right">Students</p>
                            <p className="text-lg md:text-xl font-black text-[#0A1B3C] text-left md:text-right">
                                {exam.participationCount}
                            </p>
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#F37022]/10 transition-colors shrink-0">
                        <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-[#F37022]" />
                    </div>
                </div>
            </motion.div>
        );
    };

    // --- Views ---

    const ClassesView = () => {
        if (loadingClasses) {
            return (
                <div className="col-span-full py-20 text-center">
                    <Loader2 className="w-12 h-12 text-[#F37022] animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">Loading your courses...</h3>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredClasses.length > 0 ? (
                    filteredClasses.map((cs: any) => {
                        return (
                            <motion.div
                                key={cs.classSubjectId}
                                whileHover={{ y: -4, scale: 1.02 }}
                                onClick={() => { setSelectedClass(cs); setView('EXAMS'); setSearchTerm(''); }}
                                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#F37022]/30 transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[#F37022]/5 rounded-bl-full -mr-8 -mt-8 group-hover:bg-[#F37022]/10 transition-colors" />

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="bg-blue-50 p-3 rounded-xl">
                                        <Users className="w-6 h-6 text-[#0066b3]" />
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-[#0A1B3C] mb-1 group-hover:text-[#F37022] transition-colors">{cs.classCode}</h3>
                                <p className="text-sm font-semibold text-[#0066b3] mb-3">{cs.subjectCode}</p>
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px] mb-4">{cs.subjectName}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4" />
                                        <span>View Exams</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No classes found</h3>
                        <p className="text-gray-400">Try adjusting your search</p>
                    </div>
                )}
            </motion.div>
        );
    };


    const ExamsView = () => {
        if (loadingExams) {
            return (
                <div className="py-20 text-center">
                    <Loader2 className="w-12 h-12 text-[#F37022] animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">Fetching exams...</h3>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
            >
                <div className="bg-[#0A1B3C] text-white p-6 md:p-8 rounded-3xl mb-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                        <div className="bg-white/10 p-3 md:p-4 rounded-2xl backdrop-blur-md w-fit">
                            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-[#F37022]" />
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-1 truncate">{selectedClass?.classCode}</h2>
                            <p className="text-blue-100 opacity-80 text-sm md:text-base line-clamp-1">{selectedClass?.subjectName}</p>
                        </div>
                    </div>
                </div>

                <h3 className="text-lg font-bold text-[#0A1B3C] mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-4" />
                    Available Exams
                </h3>

                {examsData?.items && examsData.items.length > 0 ? (
                    examsData.items.map((exam: any) => (
                        <ExamCard key={exam.id} exam={exam} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400">No exams found for this course.</p>
                    </div>
                )}
            </motion.div>
        );
    };

    const StudentsView = () => {
        const filteredStudents = useMemo(() => {
            return (flaggedStudents as StudentEvidence[]).filter((s: StudentEvidence) =>
                s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                s.suspiciousActivity.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }, [searchTerm, flaggedStudents]);

        if (loadingLogs) {
            return (
                <div className="py-20 text-center">
                    <Loader2 className="w-12 h-12 text-[#F37022] animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-400">Analyzing proctoring logs...</h3>
                </div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-[#0A1B3C]">{selectedExam?.displayName}</h2>
                        <p className="text-gray-500">
                            {searchTerm ? `Found ${filteredStudents.length} matches` : `Showing ${flaggedStudents.length} flagged students out of ${selectedExam?.participationCount || 0} total`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student: StudentEvidence) => (
                            <motion.div
                                key={student.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-all border-l-4 ${student.severity === 'high' ? 'border-l-red-500' :
                                    student.severity === 'medium' ? 'border-l-orange-500' : 'border-l-blue-500'
                                    }`}
                            >
                                <div className="p-4 md:p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                                                <h3 className="text-base md:text-lg font-bold text-[#0A1B3C] truncate max-w-[200px] md:max-w-none">{student.studentName}</h3>
                                                <span className="text-[10px] md:text-xs font-mono font-bold bg-[#0066b3]/10 text-[#0066b3] px-2 py-0.5 rounded shrink-0">
                                                    {student.studentCode}
                                                </span>
                                                <span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${getSeverityStyles(student.severity)}`}>
                                                    {student.severity}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[#EF4444] font-semibold text-xs md:text-sm mb-4 bg-red-50 w-fit px-3 py-1 rounded-lg max-w-full">
                                                <AlertTriangle className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                                <span className="truncate">{student.suspiciousActivity}</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6 text-[11px] md:text-sm">
                                                <div className="flex items-center gap-2 text-gray-500 truncate">
                                                    <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                                    <span className="truncate">{dayjs(student.timestamp).format('MMM DD, YYYY')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 truncate">
                                                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                                    <span className="truncate">{dayjs(student.timestamp).format('HH:mm:ss')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500 truncate">
                                                    <BarChart3 className="w-3.5 h-3.5 md:w-4 md:h-4 shrink-0" />
                                                    <span className="truncate">{student.attachments.length} Evidence</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => { setSelectedStudent(student); setView('DETAIL'); }}
                                                className="w-full lg:w-auto px-6 py-2.5 bg-[#0A1B3C] text-white text-xs md:text-sm font-bold rounded-xl hover:bg-[#F37022] transition-colors flex items-center justify-center gap-2 shadow-sm"
                                            >
                                                <Eye className="w-4 h-4 shrink-0" />
                                                Review
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-100">
                            {searchTerm ? (
                                <>
                                    <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h4 className="text-xl font-bold text-gray-400">No students found matching "{searchTerm}"</h4>
                                </>
                            ) : (
                                <>
                                    <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h4 className="text-xl font-bold text-gray-400">Excellent! No violations detected</h4>
                                    <p className="text-gray-400 mt-1">All students in this exam followed the guidelines.</p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };


    const DetailView = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
            {/* Left: Info & Description */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-[#0066b3]/10 text-[#0066b3] rounded-2xl flex items-center justify-center">
                            <GraduationCap className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-[#0A1B3C]">{selectedStudent?.studentName}</h2>
                            <p className="text-[#0066b3] font-mono text-sm font-bold">{selectedStudent?.studentCode}</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider">Current Status</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-[#F37022]">
                                        {selectedStudent?.grade !== null && selectedStudent?.grade !== undefined
                                            ? Number(selectedStudent.grade).toFixed(1)
                                            : 'N/A'}
                                    </span>
                                    <span className="text-sm font-bold text-gray-400">/ 10.0</span>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${selectedStudent?.grade >= 5 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {selectedStudent?.grade >= 5 ? 'PASSED' : 'FAILED'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider">Detection Summary</p>
                            <p className="text-sm font-semibold text-[#0A1B3C] flex items-center gap-2">
                                <AlertTriangle className={`w-4 h-4 ${selectedStudent?.severity === 'high' ? 'text-red-500' : 'text-orange-500'}`} />
                                {selectedStudent?.suspiciousActivity}
                            </p>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-xs text-gray-400 font-bold uppercase mb-2 tracking-wider">Detailed Findings</p>
                            <p className="text-sm leading-relaxed text-gray-600">
                                {selectedStudent?.description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <button
                            onClick={handleConfirmCheating}
                            disabled={isConfirmingCheating}
                            className={`w-full py-3 font-bold rounded-2xl transition-colors shadow-lg flex items-center justify-center gap-2 ${isConfirmingCheating ? 'bg-red-300 text-white cursor-not-allowed shadow-red-100' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'}`}
                        >
                            <AlertTriangle className="w-4 h-4" />
                            {isConfirmingCheating ? 'Confirming...' : 'Confirm Cheating'}
                        </button>
                        <button
                            onClick={handleDismissFalsePositive}
                            disabled={isDeletingLogs}
                            className={`w-full py-3 font-bold rounded-2xl transition-colors border ${isDeletingLogs ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'}`}
                        >
                            {isDeletingLogs ? 'Dismissing & Deleting...' : 'Dismiss False Positive'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Evidence Gallery */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm min-h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-[#0A1B3C]">Evidence Gallery</h3>
                            <p className="text-sm text-gray-400">{selectedStudent?.attachments.length} files captured by proctoring engine</p>
                        </div>
                        <button
                            onClick={handleDownloadAllAsZip}
                            disabled={isZipping || !selectedStudent?.attachments?.length}
                            className={`p-2 transition-colors rounded-xl flex items-center gap-2 ${
                                isZipping ? 'bg-gray-100 text-[#F37022] cursor-not-allowed' : 'text-gray-400 hover:text-[#0A1B3C] bg-gray-50'
                            }`}
                            title="Download All Evidence as ZIP"
                        >
                            {isZipping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedStudent?.attachments.map((file: any, idx: number) => (
                            <motion.div
                                key={idx}
                                whileHover={{ scale: 1.02 }}
                                className="group relative aspect-video bg-gray-900 rounded-2xl overflow-hidden cursor-pointer shadow-md"
                            >
                                {file.type === 'image' ? (
                                    <img
                                        src={file.url}
                                        alt={`Evidence ${idx}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <video
                                        controls
                                        playsInline
                                        preload="metadata"
                                        src={file.url}
                                        poster={file.thumbnail}
                                        className="w-full h-full object-contain bg-black"
                                    />
                                )}

                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white bg-black/20 backdrop-blur-sm p-2 rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 text-white/80" />
                                        <span className="text-xs font-mono font-medium">{file.timestamp}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const ext = file.type === 'video' ? 'webm' : 'jpg';
                                                const fileName = `${selectedStudent.studentCode}_${file.timestamp.replace(/:/g, '-')}.${ext}`;
                                                handleDownload(file.url, fileName);
                                            }}
                                            className="p-1.5 bg-white/20 hover:bg-[#F37022] text-white rounded-lg transition-colors group/btn"
                                            title="Download"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                        <Eye className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    // --- Academic Reports ---
    const { data: semesterReport, isLoading: loadingReport } = useGetSemesterReportQuery(
        semester,
        { skip: !semester || activeTab !== 'academic' }
    );
    const [exportGrades, { isFetching: exportingGrades }] = useLazyExportGradesQuery();
    const [exportQuestionReport, { isFetching: exportingReport }] = useLazyExportQuestionReportQuery();
    const [exportingSubjectId, setExportingSubjectId] = useState<string | null>(null);
    const [exportingReportId, setExportingReportId] = useState<string | null>(null);

    const handleExportSemesterReport = useCallback(() => {
        if (!semesterReport) return;
        const sem = semestersData?.items?.find((s: any) => s.id === semester);
        const rows: string[][] = [
            ['SEMESTER SUMMARY REPORT'],
            ['Semester', semesterReport.semesterCode],
            ['Period', `${dayjs(semesterReport.startDate).format('DD/MM/YYYY')} - ${dayjs(semesterReport.endDate).format('DD/MM/YYYY')}`],
            [''],
            ['OVERVIEW'],
            ['Total Subjects', String(semesterReport.totalSubjects)],
            ['Total Classes', String(semesterReport.totalClasses)],
            ['Total Students', String(semesterReport.totalStudents)],
            ['Total Teachers', String(semesterReport.totalTeachers)],
            ['Total Materials Uploaded', String(semesterReport.totalMaterialsUploaded)],
            ['Total Assignments Created', String(semesterReport.totalAssignmentsCreated)],
            ['Total Exams Created', String(semesterReport.totalExamsCreated)],
            ['Average GPA', semesterReport.averageGpa?.toFixed(2) ?? 'N/A'],
            ['Passing Rate', `${semesterReport.passingRate?.toFixed(1) ?? 'N/A'}%`],
            [''],
            ['TOP SUBJECTS BY STUDENT COUNT'],
            ['Subject Code', 'Subject Name', 'Student Count', 'Class Count'],
            ...(semesterReport.topSubjectsByStudentCount || []).map((s: any) => [
                s.subjectCode, s.subjectName, String(s.studentCount), String(s.classCount)
            ])
        ];
        const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `semester_report_${semesterReport.semesterCode}_${dayjs().format('YYYYMMDD')}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Semester report exported successfully!');
    }, [semesterReport, semestersData, semester]);

    const handleExportSubjectGrades = useCallback(async (classSubjectId: string, label: string) => {
        setExportingSubjectId(classSubjectId);
        try {
            const blob = await exportGrades(classSubjectId).unwrap();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `grades_${label.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(`Grade report for ${label} exported!`);
        } catch {
            toast.error('Failed to export grades. Please try again.');
        } finally {
            setExportingSubjectId(null);
        }
    }, [exportGrades]);

    const handleExportQuestionReport = useCallback(async (classSubjectId: string, label: string) => {
        setExportingReportId(classSubjectId);
        try {
            const blob = await exportQuestionReport(classSubjectId).unwrap();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `question_report_${label.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success(`Question report for ${label} exported!`);
        } catch {
            toast.error('Failed to export question report. Please try again.');
        } finally {
            setExportingReportId(null);
        }
    }, [exportQuestionReport]);

    const AcademicReports = () => {
        if (loadingReport) {
            return (
                <div className="py-24 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#F37022] animate-spin mb-4" />
                    <p className="text-gray-400 font-semibold">Loading semester report...</p>
                </div>
            );
        }

        const statCards = semesterReport ? [
            { label: 'Total Subjects', value: semesterReport.totalSubjects, icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
            { label: 'Total Classes', value: semesterReport.totalClasses, icon: Layers, color: 'bg-purple-50 text-purple-600' },
            { label: 'Total Students', value: semesterReport.totalStudents, icon: Users, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Total Teachers', value: semesterReport.totalTeachers, icon: GraduationCap, color: 'bg-orange-50 text-orange-600' },
            { label: 'Avg GPA', value: semesterReport.averageGpa?.toFixed(2) ?? 'N/A', icon: TrendingUp, color: 'bg-cyan-50 text-cyan-600' },
            { label: 'Passing Rate', value: `${semesterReport.passingRate?.toFixed(1) ?? 'N/A'}%`, icon: Award, color: 'bg-rose-50 text-rose-600' },
            { label: 'Materials', value: semesterReport.totalMaterialsUploaded, icon: FileText, color: 'bg-amber-50 text-amber-600' },
            { label: 'Exams Created', value: semesterReport.totalExamsCreated, icon: ClipboardList, color: 'bg-indigo-50 text-indigo-600' },
        ] : [];

        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="space-y-8"
            >
                {!semesterReport && !loadingReport && (
                    <div className="py-24 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                        <BarChart3 className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">No report available</h3>
                        <p className="text-gray-400 mt-1">Please select a semester to view the summary report.</p>
                    </div>
                )}

                {semesterReport && (
                    <>
                        {/* Summary Banner */}
                        <div className="bg-gradient-to-r from-[#0A1B3C] to-[#0066b3] text-white p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff opacity=.04%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur">
                                            <ClipboardList className="w-6 h-6 text-[#F37022]" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl md:text-3xl font-black">{semesterReport.semesterCode}</h2>
                                            <p className="text-blue-200 text-sm">
                                                {dayjs(semesterReport.startDate).format('DD MMM YYYY')} &mdash; {dayjs(semesterReport.endDate).format('DD MMM YYYY')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    id="export-semester-report-btn"
                                    onClick={handleExportSemesterReport}
                                    className="flex items-center gap-2.5 px-6 py-3 bg-[#F37022] hover:bg-[#d95f10] text-white font-bold rounded-2xl transition-all shadow-lg shadow-orange-900/30 shrink-0"
                                >
                                    <FileSpreadsheet className="w-5 h-5" />
                                    Export Report (.csv)
                                </button>
                            </div>
                        </div>

                        {/* Stat Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {statCards.map((card) => (
                                <div key={card.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                    <div className={`${card.color} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
                                        <card.icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-2xl font-black text-[#0A1B3C]">{card.value}</p>
                                    <p className="text-xs text-gray-400 font-semibold mt-0.5">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Top Subjects */}
                        {semesterReport.topSubjectsByStudentCount?.length > 0 && (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                                <h3 className="text-lg font-bold text-[#0A1B3C] mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-[#F37022]" />
                                    Top Subjects by Enrollment
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">#</th>
                                                <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</th>
                                                <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Name</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Classes</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Students</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {semesterReport.topSubjectsByStudentCount.map((s: any, i: number) => (
                                                <tr key={s.subjectId} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                                    <td className="py-3 px-3 text-gray-400 font-mono text-xs">{i + 1}</td>
                                                    <td className="py-3 px-3">
                                                        <span className="font-mono font-bold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded text-xs">{s.subjectCode}</span>
                                                    </td>
                                                    <td className="py-3 px-3 font-medium text-[#0A1B3C]">{s.subjectName}</td>
                                                    <td className="py-3 px-3 text-right text-gray-600 font-bold">{s.classCount}</td>
                                                    <td className="py-3 px-3 text-right">
                                                        <span className="font-black text-[#0A1B3C]">{s.studentCount}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Per-Subject Grade Reports */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-[#0A1B3C] mb-1 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-[#F37022]" />
                                Detailed Grade Reports by Subject
                            </h3>
                            <p className="text-sm text-gray-400 mb-5">Export the full grade breakdown for each class-subject you teach this semester.</p>
                            {allAvailableClasses.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                                    No class-subjects found for this semester.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Class</th>
                                                <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Subject</th>
                                                <th className="text-left py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Subject Name</th>
                                                <th className="text-right py-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allAvailableClasses.map((cs: any) => (
                                                <tr key={cs.classSubjectId} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                                    <td className="py-3 px-3">
                                                        <span className="font-bold text-[#0A1B3C]">{cs.classCode}</span>
                                                    </td>
                                                    <td className="py-3 px-3">
                                                        <span className="font-mono font-bold text-[#0066b3] bg-blue-50 px-2 py-0.5 rounded text-xs">{cs.subjectCode}</span>
                                                    </td>
                                                    <td className="py-3 px-3 text-gray-600">{cs.subjectName}</td>
                                                    <td className="py-3 px-3 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                id={`export-grades-${cs.classSubjectId}`}
                                                                disabled={exportingSubjectId === cs.classSubjectId}
                                                                onClick={() => handleExportSubjectGrades(cs.classSubjectId, `${cs.classCode}_${cs.subjectCode}`)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A1B3C] hover:bg-[#F37022] text-white text-[10px] md:text-xs font-bold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                                title="Export Grades"
                                                            >
                                                                {exportingSubjectId === cs.classSubjectId
                                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    : <Download className="w-3.5 h-3.5" />}
                                                                {exportingSubjectId === cs.classSubjectId ? 'Exporting...' : 'Grades'}
                                                            </button>
                                                            <button
                                                                id={`export-questions-${cs.classSubjectId}`}
                                                                disabled={exportingReportId === cs.classSubjectId}
                                                                onClick={() => handleExportQuestionReport(cs.classSubjectId, `${cs.classCode}_${cs.subjectCode}`)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#0A1B3C] text-[#0A1B3C] hover:bg-gray-50 text-[10px] md:text-xs font-bold rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                                                title="Export Question Report"
                                                            >
                                                                {exportingReportId === cs.classSubjectId
                                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                    : <FileText className="w-3.5 h-3.5" />}
                                                                {exportingReportId === cs.classSubjectId ? 'Exporting...' : 'Questions'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-[#F37022] p-2 rounded-lg shadow-lg shadow-orange-200">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-[#0A1B3C]">Reports</h1>
                        </div>
                        <p className="text-gray-500 font-medium">Monitor academic performance and proctoring evidence</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                        {activeTab === 'integrity' && (
                            <div className="relative flex-1 sm:min-w-[240px]">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search student or class..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F37022]/20 focus:border-[#F37022] outline-none transition-all w-full shadow-sm"
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select
                                value={semester}
                                onChange={(value) => setSemester(value)}
                                className="flex-1 sm:min-w-[160px] h-[42px]"
                                placeholder="Select Semester"
                                dropdownStyle={{ borderRadius: '12px' }}
                                options={[
                                    ...semestersList.map((sem: any) => ({
                                        label: sem.semesterCode,
                                        value: sem.id
                                    })),
                                    ...(semestersList.length === 0 && defaultSemester ? [{
                                        label: defaultSemester.semesterCode,
                                        value: defaultSemester.id
                                    }] : [])
                                ]}
                            />
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-1 mt-6 bg-white border border-gray-100 rounded-2xl p-1.5 w-fit shadow-sm">
                    <button
                        id="tab-integrity-reports"
                        onClick={() => setActiveTab('integrity')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'integrity'
                                ? 'bg-[#0A1B3C] text-white shadow-md'
                                : 'text-gray-500 hover:text-[#0A1B3C] hover:bg-gray-50'
                        }`}
                    >
                        <ShieldAlert className="w-4 h-4" />
                        Integrity Reports
                    </button>
                    <button
                        id="tab-academic-reports"
                        onClick={() => setActiveTab('academic')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'academic'
                                ? 'bg-[#0A1B3C] text-white shadow-md'
                                : 'text-gray-500 hover:text-[#0A1B3C] hover:bg-gray-50'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Academic Reports
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'integrity' && (
                        <motion.div
                            key="integrity"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Navigation & Toolbar */}
                            <div className="flex items-center justify-between mb-4">
                                <Breadcrumbs />
                                {view !== 'CLASSES' && (
                                    <button
                                        onClick={handleBack}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0A1B3C] transition-colors mb-6 group"
                                    >
                                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                        Back to {view === 'DETAIL' ? 'Students' : view === 'STUDENTS' ? 'Exams' : 'Classes'}
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <AnimatePresence mode="wait">
                                    {view === 'CLASSES' && <ClassesView key="classes" />}
                                    {view === 'EXAMS' && <ExamsView key="exams" />}
                                    {view === 'STUDENTS' && <StudentsView key="students" />}
                                    {view === 'DETAIL' && <DetailView key="detail" />}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                    {activeTab === 'academic' && <AcademicReports key="academic" />}
                </AnimatePresence>
            </div>

            {/* Confirm Modal */}
            <AnimatePresence>
                {confirmModal.open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
                        onClick={closeConfirmModal}
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0, y: 16 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0, y: 16 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
                        >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 mx-auto ${confirmModal.isDangerous ? 'bg-red-50' : 'bg-orange-50'}`}>
                                <AlertTriangle className={`w-7 h-7 ${confirmModal.isDangerous ? 'text-red-500' : 'text-orange-500'}`} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0A1B3C] text-center mb-2">{confirmModal.title}</h3>
                            <p className="text-sm text-gray-500 text-center leading-relaxed mb-8">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={closeConfirmModal}
                                    className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className={`flex-1 py-3 rounded-2xl font-bold text-white transition-colors shadow-lg ${confirmModal.isDangerous ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200'}`}
                                >
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TeacherReports;

