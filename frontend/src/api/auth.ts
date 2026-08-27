import { apiRequest } from "./../api/client";

export type UserRole =
  | "ADMIN"
  | "TPO"
  | "DEPARTMENT"
  | "STUDENT";

export type AccountStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "DISABLED";

export interface CurrentUser {
  user_id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
}

export interface LoginResponse {
  message: string;
  user_id: string;
  role: UserRole;
  status: AccountStatus;
}

export interface RegisterResponse {
  message: string;
  user_id: string;
  status: AccountStatus;
}

export interface TPORegistrationData {
  officer_name: string;
  email: string;
  password: string;
  college_name: string;
  college_email: string;
  contact_number: string;
  pincode: string;
  city: string;
  state: string;
  college_website?: string;
}

export interface DepartmentRegistrationData {
  officer_name: string;
  officer_email: string;
  officer_contact: string;
  department_name: string;
  email: string;
  password: string;
  tpo_profile_id: string;
}

export interface StudentRegistrationData {
  full_name: string;
  college_email: string;
  personal_email: string;
  password: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  exam_roll_number: string;
  department_profile_id: string;
  degree: string;
  batch_year: number;
  graduation_year: number;
}

export function login(
  email: string,
  password: string,
) {
  return apiRequest<LoginResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );
}

export function getCurrentUser() {
  return apiRequest<CurrentUser>(
    "/api/auth/me",
  );
}

export function logout() {
  return apiRequest<{ message: string }>(
    "/api/auth/logout",
    {
      method: "POST",
    },
  );
}

export function registerTPO(
  data: TPORegistrationData,
) {
  return apiRequest<RegisterResponse>(
    "/api/auth/register/tpo",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function registerDepartment(
  data: DepartmentRegistrationData,
) {
  return apiRequest<RegisterResponse>(
    "/api/auth/register/department",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function registerStudent(
  data: StudentRegistrationData,
) {
  return apiRequest<RegisterResponse>(
    "/api/auth/register/student",
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}