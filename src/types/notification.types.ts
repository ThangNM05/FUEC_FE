/** Matches NotificationDto from RealTimeNotificationService.cs */
export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string; // ISO date string
  relatedEntityId?: string;
  relatedEntityType?: string;
}

export type NotificationType =
  | 'General'
  | 'Assignment'
  | 'Exam'
  | 'Grade'
  | 'Announcement'
  | 'System';

/** Matches AssignmentNotificationDto */
export interface AssignmentNotificationDto {
  assignmentId: string;
  assignmentTitle: string;
  classId: string;
  className: string;
  action: string; // "Created" | "Updated" | "Deleted" | "Graded"
  dueDate?: string;
  message: string;
  createdAt: string;
}

/** Matches ExamNotificationDto */
export interface ExamNotificationDto {
  examId: string;
  examTitle: string;
  classId: string;
  className: string;
  action: string;
  scheduledAt?: string;
  message: string;
  createdAt: string;
}

/** Matches GradeNotificationDto */
export interface GradeNotificationDto {
  assignmentId?: string;
  examId?: string;
  subjectName: string;
  grade: number;
  maxGrade: number;
  message: string;
  createdAt: string;
}

/** Matches AnnouncementDto */
export interface AnnouncementDto {
  id: string;
  title: string;
  content: string;
  priority: 'Low' | 'Normal' | 'High' | 'Critical';
  createdAt: string;
}

/** Unified notification item used in the FE store */
export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string;
}
