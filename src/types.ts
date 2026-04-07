export type Role = 'mentor' | 'tutor' | 'team_leader';

export interface UserProfile {
  uid: string;
  email: string;
  password?: string; // For simulated auth
  role: Role;
  name: string;
  tutorId?: string;
  isResigned?: boolean;
  photoURL?: string;
  teamLogoURL?: string;
  // Hierarchy fields
  teamLeaderName?: string;
  teamNumber?: string;
  subTeamName?: string;
  mentorId?: string; // For tutors to link to their mentor
  mentorName?: string; // Cache for easy display
  tutorCustomId?: string; // The human-readable tutor ID (e.g. T-4688)
  globalStudySheetUrl?: string; // Master Study Sheet URL for Global Sync
  globalFlagsSheetUrl?: string; // Master Flags Sheet URL for Global Sync
}

export interface StudyPlan {
  course1: string;
  course1Grade?: string;
  course2: string;
  course2Grade?: string;
  notes: string;
  materialLink: string;
}

export interface Performance {
  quality: number;
  work: number;
  total: number;
}

export interface MonthlyStudyPlan {
  month: string;
  status: string;
  course1: string;
  course1Grade?: string;
  course2: string;
  course2Grade?: string;
  notes: string;
  materialLink: string;
}

export interface MonthlyPerformance {
  month: string;
  quality: number;
  work: number;
}

export interface TutorDetails {
  id: string;
  name: string;
  studyPlan: StudyPlan;
  studyPlanArray?: MonthlyStudyPlan[];
  performanceHistory?: MonthlyPerformance[];
  performance: Performance;
  status: 'active' | 'resigned';
  vacationCount?: number;
  redFlags?: number;
  yellowFlags?: number;
  tutorCustomId?: string;
}

export interface Vacation {
  id: string;
  date: string;
  type: string;
  reason: string;
}

export interface QualityReport {
  id: string;
  month: string;
  percentage: number;
  meetingDate: string;
  meetingLink: string;
  recordedLink: string;
  postMeetingNotes: string;
  reportUrl: string;
}

export interface Flag {
  id: string;
  type: 'red' | 'yellow';
  reason: string;
  status: 'done' | 'cancel' | 'in progress';
  tutorFeedback: string;
  mentorFeedback: string;
  date: string;
}

export interface Course {
  id: string;
  name: string;
  grade: string;
}

export interface TutorFeedback {
  id: string;
  tutorId: string;
  message: string;
  date: string;
}
