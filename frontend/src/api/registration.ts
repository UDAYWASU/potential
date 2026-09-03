import { apiRequest } from "./client";

export interface RegistrationTPO {
  id: string;
  officer_name: string;
  college_name: string;
  college_email: string;
  city: string;
  state: string;
}

export interface RegistrationTPOResponse {
  tpos: RegistrationTPO[];
}

export interface RegistrationDepartment {
  id: string;
  department_name: string;
  officer_name: string;
  college_name: string;
  tpo_name: string;
  tpo_profile_id: string;
}

export interface RegistrationDepartmentResponse {
  departments: RegistrationDepartment[];
}

export function getRegistrationTPOs() {
  return apiRequest<RegistrationTPOResponse>(
    "/api/registration/tpos"
  );
}

export function getRegistrationDepartments() {
  return apiRequest<RegistrationDepartmentResponse>(
    "/api/registration/departments"
  );
}