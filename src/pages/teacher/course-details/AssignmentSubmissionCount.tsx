import { useGetStudentAssignmentsByAssignmentIdQuery } from '@/api/studentAssignmentsApi';

interface AssignmentSubmissionCountProps {
    assignmentId: string;
    totalStudents: number;
}

export default function AssignmentSubmissionCount({ assignmentId, totalStudents }: AssignmentSubmissionCountProps) {
    const { data: submissionsData } = useGetStudentAssignmentsByAssignmentIdQuery(assignmentId, {
        skip: !assignmentId,
    });

    const items = submissionsData?.items || [];
    const submitted = items.length;
    const graded = items.filter((s: any) => s.status === 2).length;
    const pending = submitted - graded;

    return (
        <>
            <span className="font-semibold text-orange-600">
                {submitted}/{totalStudents} submitted
            </span>
            {pending > 0 && (
                <span className="font-semibold text-blue-600">
                    {pending} Pending Grading
                </span>
            )}
            {graded > 0 && (
                <span className="font-semibold text-green-600">
                    {graded} Graded
                </span>
            )}
        </>
    );
}
