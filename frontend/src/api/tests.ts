import { apiRequest } from "./client";

export type TestMode =
  | "AUTOMATIC"
  | "MANUAL"
  | "ADAPTIVE";

export type TestStatus =
  | "DRAFT"
  | "RELEASED"
  | "CLOSED";

export interface TestRequirement {
  subject: string;
  topic?: string;
  subtopic?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  question_type?: "WRITTEN" | "CODING" | "SPOKEN" | "MCQ";
  count: number;
  marks?: number;
}

export interface CreateTestRequest {
  title: string;
  description?: string;
  mode: TestMode;
  duration_minutes?: number;
  configuration?: {
    requirements?: TestRequirement[];
    [key: string]: unknown;
  };
}

export interface TestResponse {
  id: string;
  title: string;
  description?: string | null;
  mode: TestMode;
  status: TestStatus;
  duration_minutes?: number | null;
  created_at: string;
  released_at?: string | null;
}

export interface ReleaseTestResponse {
  message: string;
  test_id: string;
  status: TestStatus;
  assignments_created: number;
  released_at?: string;
}

export function createTest(data: CreateTestRequest) {
  return apiRequest<TestResponse>(
    "/api/department/tests",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function getTests() {
  return apiRequest<TestResponse[]>(
    "/api/department/tests",
  );
}

export function releaseTest(testId: string) {
  return apiRequest<ReleaseTestResponse>(
    `/api/tests/${testId}/release`,
    {
      method: "POST",
    },
  );
}


// api/tests.ts — additions (keep everything else in this file as-is)

export type QuestionType = "WRITTEN" | "CODING" | "SPOKEN" | "MCQ";

export interface ManualQuestionContent {
  text?: string;
  image_url?: string;
  audio_url?: string;
}

export interface ManualQuestion {
  question_type: QuestionType;
  subject: string;
  topic?: string;
  subtopic?: string;
  question_content: ManualQuestionContent;
  options?: string[];      // used only for MCQ
  answer: {
    text?: string;
    option_index?: number; // used only for MCQ
  };
  marks: number;
  question_metadata?: Record<string, unknown>;
}

// Extend your existing CreateTestRequest:
export interface CreateTestRequest {
  title: string;
  description?: string;
  mode: TestMode;
  duration_minutes?: number;
  configuration?: {
    requirements?: TestRequirement[];
    [key: string]: unknown;
  };
  manual_questions?: ManualQuestion[];
  adaptive_subjects?: string[];
}

export interface DepartmentTestDetail {
  id: string;
  title: string;
  description?: string;
  mode: TestMode;
  status: TestStatus;
  duration_minutes?: number;
  created_at: string;
  released_at?: string;

  question_count: number;
  assigned_count: number;
  in_progress_count: number;
  submitted_count: number;
  missed_count: number;
}

export type AssignmentStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "MISSED";

export interface DepartmentTestMonitorStudent {
  assignment_id: string;
  student_profile_id: string;
  student_name: string;
  status: AssignmentStatus;
  started_at?: string;
  submitted_at?: string;
}

export interface DepartmentTestMonitor {
  test_id: string;
  test_title: string;

  assigned_count: number;
  in_progress_count: number;
  submitted_count: number;
  missed_count: number;

  students: DepartmentTestMonitorStudent[];
}

export function getTestDetail(testId: string) {
  return apiRequest<DepartmentTestDetail>(
    `/api/department/tests/${testId}`,
  );
}

export function getTestMonitor(testId: string) {
  return apiRequest<DepartmentTestMonitor>(
    `/api/department/tests/${testId}/monitor`,
  );
}

export interface CloseTestResponse {
  message: string;
  test_id: string;
  status: TestStatus;
}

export function closeTest(testId: string) {
  return apiRequest<CloseTestResponse>(
    `/api/department/tests/${testId}/close`,
    {
      method: "POST",
    },
  );
}