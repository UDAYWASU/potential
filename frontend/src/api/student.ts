import { apiRequest } from "./client";

export interface StudentProfile {
  user_id: string;
  profile_id: string;

  full_name: string;
  college_email: string;
  personal_email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  exam_roll_number: string;

  degree: string;
  batch_year: number;
  graduation_year: number;

  department_profile_id: string;
}

export function getStudentProfile() {
  return apiRequest<StudentProfile>(
    "/api/student/me",
  );
}


export type StudentAssignmentStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "MISSED";


export interface StudentTestAssignment {
  assignment_id: string;
  test_id: string;

  title: string;
  description?: string | null;

  mode:
    | "AUTOMATIC"
    | "MANUAL"
    | "ADAPTIVE";

  duration_minutes?: number | null;

  status: StudentAssignmentStatus;

  assigned_at: string;
  started_at?: string | null;
  submitted_at?: string | null;

  released_at?: string | null;
}


export interface StudentTestsResponse {
  tests: StudentTestAssignment[];
}


export function getStudentTests() {
  return apiRequest<StudentTestsResponse>(
    "/api/student/tests",
  );
}

export interface StudentAttemptQuestion {
  question_id: string;
  sequence_number: number;

  question: Record<string, unknown>;
  marks?: number | null;

  answer?: Record<string, unknown> | null;
  is_answered: boolean;
}


export interface StudentTestAttempt {
  assignment_id: string;
  test_id: string;

  title: string;
  description?: string | null;

  mode:
    | "AUTOMATIC"
    | "MANUAL"
    | "ADAPTIVE";

  duration_minutes?: number | null;

  status: StudentAssignmentStatus;

  started_at?: string | null;
  submitted_at?: string | null;

  questions: StudentAttemptQuestion[];
}


export interface StudentAnswerResponse {
  message: string;
  question_id: string;
  answer?: Record<string, unknown> | null;
}


export interface StudentSubmitResponse {
  message: string;
  assignment_id: string;
  status: StudentAssignmentStatus;
  submitted_at: string;
}


export function startStudentTest(
  assignmentId: string,
) {
  return apiRequest<StudentTestAttempt>(
    `/api/student/assignments/${assignmentId}/start`,
    {
      method: "POST",
    },
  );
}


export function getStudentTestAttempt(
  assignmentId: string,
) {
  return apiRequest<StudentTestAttempt>(
    `/api/student/assignments/${assignmentId}`,
  );
}


export function saveStudentAnswer(
  assignmentId: string,
  questionId: string,
  answer: Record<string, unknown> | null,
) {
  return apiRequest<StudentAnswerResponse>(
    `/api/student/assignments/${assignmentId}/questions/${questionId}/answer`,
    {
      method: "POST",
      body: JSON.stringify({
        answer,
      }),
    },
  );
}


export function submitStudentTest(
  assignmentId: string,
) {
  return apiRequest<StudentSubmitResponse>(
    `/api/student/assignments/${assignmentId}/submit`,
    {
      method: "POST",
    },
  );
}