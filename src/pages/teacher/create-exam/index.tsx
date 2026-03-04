import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
    ChevronRight, ChevronLeft, Save,
    FileQuestion, Clock, Shield, Globe, Hash, Tag, Calendar, Eye, Lock, Wifi
} from 'lucide-react';
import { toast } from 'sonner';
import { useGetClassSubjectByIdQuery } from '@/api/classDetailsApi';
import { useGetSubjectSyllabusesQuery } from '@/api/subjectsApi';
import { useGetSyllabusAssessmentsQuery } from '@/api/syllabusApi';
import { useGetExamFormatsQuery } from '@/api/examFormatsApi';
import { useCreateExamMutation } from '@/api/examsApi';

interface ExamFormData {
    questionCount: number;
    tag: string;
    syllabusAssessmentId: string;
    examFormatId: string;
    startTime: string;
    endTime: string;
    isPublicGrade: boolean;
    instanceNumber: number;
    securityMode: number; // 1 = Static Code, 2 = Dynamic Code
    requireIpCheck: boolean;
    allowedIpRanges: string;
    codeDuration: number;
}

// Mock data — will be replaced by API calls later
function CreateExam() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get('course') || '';

    // Fetch course data for breadcrumb
    const { data: classSubject } = useGetClassSubjectByIdQuery(courseId, {
        skip: !courseId,
    });
    const courseName = classSubject
        ? `${classSubject.subjectCode} - ${classSubject.classCode}`
        : '';

    // Fetch Syllabus and Assessments
    const { data: syllabuses } = useGetSubjectSyllabusesQuery(classSubject?.subjectId || '', {
        skip: !classSubject?.subjectId,
    });
    const syllabusId = syllabuses?.[0]?.id || '';
    const { data: assessments } = useGetSyllabusAssessmentsQuery(syllabusId, {
        skip: !syllabusId,
    });
    const filteredAssessments = assessments?.filter(
        a => a.category === 'Progress Test' || a.shortCode === 'PT' || a.category === 'Assignment' || a.shortCode === 'ASM'
    ) || [];

    // Fetch Exam Formats
    const { data: examFormatsData } = useGetExamFormatsQuery({ page: 1, pageSize: 100 });
    const examFormats = examFormatsData?.items || [];

    const [createExam, { isLoading: isCreating }] = useCreateExamMutation();

    const [isSubmitted, setIsSubmitted] = useState(false);

    const [form, setForm] = useState<ExamFormData>({
        questionCount: 30,
        tag: 'PT1',
        syllabusAssessmentId: '',
        examFormatId: '',
        startTime: '',
        endTime: '',
        isPublicGrade: true,
        instanceNumber: 1,
        securityMode: 1,
        requireIpCheck: false,
        allowedIpRanges: '',
        codeDuration: 60,
    });

    const updateField = <K extends keyof ExamFormData>(key: K, value: ExamFormData[K]) => {
        if (key === 'tag') {
            let instanceNum = 1;
            if (value === 'PT2') instanceNum = 2;
            if (value === 'PT3') instanceNum = 3;
            setForm(prev => ({ ...prev, tag: value as string, instanceNumber: instanceNum }));
        } else {
            setForm(prev => ({ ...prev, [key]: value }));
        }
    };

    // Validation
    const errors: Partial<Record<keyof ExamFormData, string>> = {};
    if (!form.syllabusAssessmentId) errors.syllabusAssessmentId = 'Required';
    if (!form.examFormatId) errors.examFormatId = 'Required';
    if (form.questionCount <= 0 || form.questionCount > 60) errors.questionCount = 'Must be 1–60';
    if (!form.startTime) errors.startTime = 'Required';
    if (!form.endTime) errors.endTime = 'Required';
    if (form.startTime && form.endTime && new Date(form.endTime) <= new Date(form.startTime)) {
        errors.endTime = 'Must be after start time';
    }
    if (form.requireIpCheck && !form.allowedIpRanges.trim()) {
        errors.allowedIpRanges = 'Required when IP check is enabled';
    }

    const isValid = Object.keys(errors).length === 0;

    const handleSubmit = async () => {
        setIsSubmitted(true);
        if (!isValid) {
            toast.error('Please fix validation errors before submitting.');
            return;
        }

        // Build API payload
        const payload = {
            ...form,
            classSubjectId: courseId,
            startTime: new Date(form.startTime).toISOString(),
            endTime: new Date(form.endTime).toISOString(),
        };

        try {
            await createExam(payload).unwrap();
            toast.success('Exam created successfully!');
            navigate(`/teacher/course-details/${courseId}`);
        } catch (error: any) {
            console.error('Failed to create exam:', error);
            toast.error(error?.data?.message || 'Failed to create exam. Please try again.');
        }
    };

    const Field = ({ label, required, error, children, icon: Icon, hint }: {
        label: string;
        required?: boolean;
        error?: string;
        children: React.ReactNode;
        icon?: any;
        hint?: string;
    }) => {
        const displayError = isSubmitted ? error : undefined;
        return (
            <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                    {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
                {children}
                {hint && !displayError && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
                {displayError && <p className="text-xs text-red-500 mt-1">{displayError}</p>}
            </div>
        );
    };

    const inputClass = (hasError?: string) =>
        `w-full px-3.5 py-2.5 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${(isSubmitted && hasError)
            ? 'border-red-300 focus:ring-red-200 bg-red-50/30'
            : 'border-gray-200 focus:ring-[#F37022]/20 focus:border-[#F37022]'
        }`;

    const selectClass = (hasError?: string) =>
        `${inputClass(hasError)} appearance-none bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239ca3af%22%20stroke-width%3D%222.5%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22m19.5%208.25-7.5%207.5-7.5-7.5%22%2F%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_12px_center] bg-no-repeat pr-10`;

    return (
        <div className="p-4 md:p-6 animate-fadeIn">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <button onClick={() => navigate('/teacher')} className="hover:text-[#F37022] transition-colors">Home</button>
                <ChevronRight className="w-3.5 h-3.5" />
                <button onClick={() => navigate('/teacher/classrooms')} className="hover:text-[#F37022] transition-colors">My Classes</button>
                {courseId && (
                    <>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <button onClick={() => navigate(`/teacher/course-details/${courseId}`)} className="hover:text-[#F37022] transition-colors">
                            {courseName || 'Course Details'}
                        </button>
                    </>
                )}
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-[#0A1B3C] font-medium">Create Exam</span>
            </div>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-[#0A1B3C]">Create New Exam</h1>
                <p className="text-gray-500 mt-1">Configure all exam parameters before submission</p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* ═══════════════════════════════════════════
                    Section 1: Basic Configuration
                ═══════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-[#F37022]/10 flex items-center justify-center">
                            <FileQuestion className="w-4 h-4 text-[#F37022]" />
                        </div>
                        <h2 className="text-lg font-bold text-[#0A1B3C]">Basic Configuration</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Syllabus Assessment */}
                            <Field label="Assessment Type" required error={errors.syllabusAssessmentId} icon={Eye}>
                                <select
                                    value={form.syllabusAssessmentId}
                                    onChange={e => updateField('syllabusAssessmentId', e.target.value)}
                                    className={selectClass(errors.syllabusAssessmentId)}
                                >
                                    <option value="">Select assessment...</option>
                                    {filteredAssessments.map(sa => (
                                        <option key={sa.id} value={sa.id}>
                                            {sa.category} — {sa.duration}m ({sa.weight}%)
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            {/* Exam Format */}
                            <Field label="Exam Format" required error={errors.examFormatId} icon={FileQuestion}>
                                <select
                                    value={form.examFormatId}
                                    onChange={e => updateField('examFormatId', e.target.value)}
                                    className={selectClass(errors.examFormatId)}
                                >
                                    <option value="">Select format...</option>
                                    {examFormats.map(ef => (
                                        <option key={ef.id} value={ef.id}>{ef.typeName} ({ef.code})</option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Question Count */}
                            <Field label="Question Count" required error={errors.questionCount} icon={Hash} hint="Max 60 questions">
                                <input
                                    type="number"
                                    value={form.questionCount}
                                    onChange={e => updateField('questionCount', parseInt(e.target.value) || 0)}
                                    min={1}
                                    max={60}
                                    className={inputClass(errors.questionCount)}
                                />
                            </Field>

                            {/* Tag */}
                            <Field label="Tag / Label" icon={Tag}>
                                <select
                                    value={form.tag}
                                    onChange={e => updateField('tag', e.target.value)}
                                    className={selectClass()}
                                >
                                    <option value="PT1">PT1</option>
                                    <option value="PT2">PT2</option>
                                    <option value="PT3">PT3</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    Section 2: Schedule
                ═══════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <h2 className="text-lg font-bold text-[#0A1B3C]">Schedule</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Start Time" required error={errors.startTime} icon={Clock}>
                            <input
                                type="datetime-local"
                                value={form.startTime}
                                onChange={e => updateField('startTime', e.target.value)}
                                className={inputClass(errors.startTime)}
                            />
                        </Field>

                        <Field label="End Time" required error={errors.endTime} icon={Clock}>
                            <input
                                type="datetime-local"
                                value={form.endTime}
                                onChange={e => updateField('endTime', e.target.value)}
                                min={form.startTime}
                                className={inputClass(errors.endTime)}
                            />
                        </Field>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    Section 3: Security & Options
                ═══════════════════════════════════════════ */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-[#0A1B3C]">Security & Options</h2>
                    </div>

                    <div className="space-y-5">
                        {/* Security Mode */}
                        <Field label="Security Mode" icon={Lock}>
                            <div className="flex gap-3">
                                {[
                                    { value: 1, label: 'Static Code', desc: 'One exam code for the entire session' },
                                    { value: 2, label: 'Dynamic Code', desc: 'Code refreshes periodically' },
                                ].map(mode => (
                                    <button
                                        key={mode.value}
                                        type="button"
                                        onClick={() => updateField('securityMode', mode.value)}
                                        className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${form.securityMode === mode.value
                                            ? 'border-[#F37022] bg-orange-50/50 ring-1 ring-[#F37022]/20'
                                            : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${form.securityMode === mode.value
                                                ? 'border-[#F37022]'
                                                : 'border-gray-300'
                                                }`}>
                                                {form.securityMode === mode.value && (
                                                    <div className="w-2 h-2 rounded-full bg-[#F37022]" />
                                                )}
                                            </div>
                                            <span className="text-sm font-semibold text-[#0A1B3C]">{mode.label}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 ml-6">{mode.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </Field>

                        {/* Code Duration (only relevant for Dynamic Code) */}
                        {form.securityMode === 2 && (
                            <div className="animate-fadeIn">
                                <Field label="Code Duration (seconds)" icon={Clock} hint="How long each code remains valid">
                                    <input
                                        type="number"
                                        value={form.codeDuration}
                                        onChange={e => updateField('codeDuration', parseInt(e.target.value) || 60)}
                                        min={10}
                                        className={inputClass()}
                                    />
                                </Field>
                            </div>
                        )}

                        {/* Toggles Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Public Grade Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Eye className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-[#0A1B3C]">Public Grade</p>
                                        <p className="text-xs text-gray-500">Students can see their grades</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => updateField('isPublicGrade', !form.isPublicGrade)}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublicGrade ? 'bg-[#F37022]' : 'bg-gray-300'
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isPublicGrade ? 'translate-x-[22px]' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>

                            {/* IP Check Toggle */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <Wifi className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-[#0A1B3C]">Require IP Check</p>
                                        <p className="text-xs text-gray-500">Restrict by IP address</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => updateField('requireIpCheck', !form.requireIpCheck)}
                                    className={`relative w-11 h-6 rounded-full transition-colors ${form.requireIpCheck ? 'bg-[#F37022]' : 'bg-gray-300'
                                        }`}
                                >
                                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.requireIpCheck ? 'translate-x-[22px]' : 'translate-x-0.5'
                                        }`} />
                                </button>
                            </div>
                        </div>

                        {/* Allowed IP Ranges — conditional */}
                        {form.requireIpCheck && (
                            <div className="animate-fadeIn">
                                <Field label="Allowed IP Ranges" required error={errors.allowedIpRanges} icon={Wifi} hint="e.g. 192.168.1.0/24, 10.0.0.0/8">
                                    <input
                                        type="text"
                                        value={form.allowedIpRanges}
                                        onChange={e => updateField('allowedIpRanges', e.target.value)}
                                        placeholder="192.168.1.0/24"
                                        className={inputClass(errors.allowedIpRanges)}
                                    />
                                </Field>
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════
                    Section 4: Summary Preview
                ═══════════════════════════════════════════ */}
                <div className="bg-gradient-to-r from-[#0A1B3C] to-[#142d5c] rounded-2xl p-6 text-white">
                    <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wide mb-4">Summary</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <div className="text-2xl font-bold">{form.questionCount}</div>
                            <div className="text-xs text-white/60">Questions</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{form.securityMode === 1 ? 'Static' : 'Dynamic'}</div>
                            <div className="text-xs text-white/60">Security Mode</div>
                        </div>
                        {form.securityMode === 2 && (
                            <div>
                                <div className="text-2xl font-bold">{form.codeDuration}s</div>
                                <div className="text-xs text-white/60">Code Duration</div>
                            </div>
                        )}
                    </div>
                    {form.startTime && form.endTime && (
                        <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-sm">
                            <span className="text-white/70">
                                📅 {new Date(form.startTime).toLocaleString('vi-VN')} → {new Date(form.endTime).toLocaleString('vi-VN')}
                            </span>
                        </div>
                    )}
                </div>

                {/* ═══════════════════════════════════════════
                    Action Buttons
                ═══════════════════════════════════════════ */}
                <div className="flex items-center justify-between pt-2 pb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isCreating}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#F37022] text-white rounded-xl text-sm font-semibold hover:bg-[#d95f19] shadow-lg shadow-orange-200/50 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isCreating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Create Exam
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateExam;
