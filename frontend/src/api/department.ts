import { apiRequest } from "./client";

/* =========================================================
   Shared Types
========================================================= */

export type TestMode =
  | "AUTOMATIC"
  | "MANUAL"
  | "ADAPTIVE";

export type TestStatus =
  | "DRAFT"
  | "RELEASED"
  | "CLOSED";

export type AssignmentStatus =
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "MISSED";


/* =========================================================
   Department Profile
========================================================= */

export interface DepartmentProfile {
  id: string;
  user_id: string;
  tpo_profile_id: string;

  officer_name: string;
  officer_email: string;
  officer_contact: string;

  department_name: string;
}


/* =========================================================
   Dashboard
========================================================= */

export interface DashboardTestSummary {
  id: string;
  title: string;

  mode: TestMode;
  status: TestStatus;

  created_at: string;
  released_at?: string | null;

  assigned_count: number;
  submitted_count: number;
  missed_count: number;
}


export interface DepartmentDashboardResponse {
  total_students: number;
  total_tests: number;

  draft_tests: number;
  released_tests: number;
  closed_tests: number;

  total_assignments: number;
  submitted_assignments: number;
  in_progress_assignments: number;
  missed_assignments: number;

  average_percentage: number | null;

  recent_tests: DashboardTestSummary[];
}


/* =========================================================
   Students
========================================================= */

export interface DepartmentStudent {
  user_id: string;
  profile_id: string;

  full_name: string;

  college_email: string;
  personal_email?: string | null;

  phone_number?: string | null;

  date_of_birth?: string | null;
  gender?: string | null;

  exam_roll_number?: string | null;

  degree?: string | null;

  batch_year?: number | null;
  graduation_year?: number | null;
}


/* =========================================================
   Student Test History
========================================================= */

export interface DepartmentStudentTestRecord {
  assignment_id: string;
  test_id: string;

  test_title: string;

  test_mode: TestMode;

  status: AssignmentStatus;

  started_at?: string | null;
  submitted_at?: string | null;

  score?: number | null;
  percentage?: number | null;
}


/* =========================================================
   Student Performance
========================================================= */

export interface DepartmentStudentPerformance {
  total_tests: number;

  completed_tests: number;
  in_progress_tests: number;
  missed_tests: number;

  average_percentage?: number | null;
}


/* =========================================================
   Student Detail
========================================================= */

export interface DepartmentStudentDetail {
  student: DepartmentStudent;

  test_history: DepartmentStudentTestRecord[];

  performance: DepartmentStudentPerformance;
}


/* =========================================================
   Tests
========================================================= */

export interface DepartmentTest {
  id: string;

  title: string;
  description?: string | null;

  mode: TestMode;
  status: TestStatus;

  duration_minutes?: number | null;

  created_at: string;
  released_at?: string | null;
}


/* =========================================================
   Test Detail
========================================================= */

export interface DepartmentTestDetail {
  id: string;

  title: string;
  description?: string | null;

  mode: TestMode;
  status: TestStatus;

  duration_minutes?: number | null;

  created_at: string;
  released_at?: string | null;

  question_count: number;

  assigned_count: number;
  in_progress_count: number;
  submitted_count: number;
  missed_count: number;
}


/* =========================================================
   Test Monitor
========================================================= */

export interface DepartmentTestMonitorStudent {
  assignment_id: string;
  student_profile_id: string;

  student_name: string;

  status: AssignmentStatus;

  started_at?: string | null;
  submitted_at?: string | null;
}


export interface DepartmentTestMonitorResponse {
  test_id: string;
  test_title: string;

  assigned_count: number;
  in_progress_count: number;
  submitted_count: number;
  missed_count: number;

  students: DepartmentTestMonitorStudent[];
}


/* =========================================================
   Test Results
   Kept here for later.
========================================================= */

export interface DepartmentTestResultStudent {
  assignment_id: string;
  student_profile_id: string;

  student_name: string;

  total_marks?: number | null;
  obtained_marks?: number | null;
  percentage?: number | null;

  llm_analysis_completed: boolean;

  released: boolean;
  released_at?: string | null;
}


export interface DepartmentTestResultsResponse {
  test_id: string;
  test_title: string;

  results: DepartmentTestResultStudent[];
}


/* =========================================================
   API FUNCTIONS
========================================================= */


/* ---------- Profile ---------- */

export function getDepartmentProfile() {
  return apiRequest<DepartmentProfile>(
    "/api/department/me",
  );
}


/* ---------- Dashboard ---------- */

export function getDepartmentDashboard() {
  return apiRequest<DepartmentDashboardResponse>(
    "/api/department/dashboard",
  );
}


/* ---------- Students ---------- */

export function getDepartmentStudents() {
  return apiRequest<DepartmentStudent[]>(
    "/api/department/students",
  );
}


export function getDepartmentStudentDetail(
  studentId: string,
) {
  return apiRequest<DepartmentStudentDetail>(
    `/api/department/students/${studentId}`,
  );
}


/* ---------- Tests ---------- */

export function getDepartmentTests() {
  return apiRequest<DepartmentTest[]>(
    "/api/department/tests",
  );
}


export function getDepartmentTestDetail(
  testId: string,
) {
  return apiRequest<DepartmentTestDetail>(
    `/api/department/tests/${testId}`,
  );
}


/* ---------- Test Monitor ---------- */

export function getDepartmentTestMonitor(
  testId: string,
) {
  return apiRequest<DepartmentTestMonitorResponse>(
    `/api/department/tests/${testId}/monitor`,
  );
}


/* ---------- Test Results ---------- */

export function getDepartmentTestResults(
  testId: string,
) {
  return apiRequest<DepartmentTestResultsResponse>(
    `/api/department/tests/${testId}/results`,
  );
}