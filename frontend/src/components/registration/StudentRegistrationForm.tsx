import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { registerStudent } from "../../api/auth";
import type { StudentRegistrationData } from "../../api/auth";
import {
  getRegistrationDepartments,
  type RegistrationDepartment,
} from "../../api/registration";

interface Props {
  onBack: () => void;
  onSuccess: (message: string) => void;
}

const labelCls =
  "block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2 mt-5 first:mt-0";
const inputCls =
  "w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors";

export default function StudentRegistrationForm({
  onBack,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    full_name: "",
    college_email: "",
    personal_email: "",
    password: "",
    confirm_password: "",
    phone_number: "",
    date_of_birth: "",
    gender: "",
    exam_roll_number: "",
    department_profile_id: "",
    degree: "",
    batch_year: "",
    graduation_year: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState<RegistrationDepartment[]>(
    []
  );

  const [loadingDepartments, setLoadingDepartments] = useState(true);

  useEffect(() => {
    async function loadDepartments() {
      try {
        setLoadingDepartments(true);

        const response = await getRegistrationDepartments();

        setDepartments(response.departments);
      } catch (error) {
        console.error("Failed to load departments:", error);
      } finally {
        setLoadingDepartments(false);
      }
    }

    loadDepartments();
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.department_profile_id.trim()) {
      setError("Department is required.");
      return;
    }

    setLoading(true);

    try {
      const data: StudentRegistrationData = {
        full_name: form.full_name,
        college_email: form.college_email,
        personal_email: form.personal_email,
        password: form.password,
        phone_number: form.phone_number,
        date_of_birth: form.date_of_birth,
        gender: form.gender,
        exam_roll_number: form.exam_roll_number,
        department_profile_id: form.department_profile_id,
        degree: form.degree,
        batch_year: Number(form.batch_year),
        graduation_year: Number(form.graduation_year),
      };

      const response = await registerStudent(data);
      onSuccess(response.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[#8a7a5c] hover:text-[#7a4a25] transition-colors"
        >
          ← Change account type
        </button>

        <h2 className="mt-3 text-lg font-serif font-medium text-[#2b2318]">
          Student Registration
        </h2>

        <p className="mt-1 text-sm text-[#8a7a5c]">
          Your account can be used immediately after registration.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 border border-[#c98a5f] bg-[#f6e3d3] text-[#7a3a1a] text-sm px-4 py-3"
        >
          {error}
        </div>
      )}

      <label className={labelCls}>
        Full Name
        <input
          className={inputCls}
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls}>
        College Email
        <input
          className={inputCls}
          type="email"
          name="college_email"
          value={form.college_email}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls}>
        Personal Email
        <input
          className={inputCls}
          type="email"
          name="personal_email"
          value={form.personal_email}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls}>
        Password
        <input
          className={inputCls}
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          minLength={8}
        />
      </label>

      <label className={labelCls}>
        Confirm Password
        <input
          className={inputCls}
          type="password"
          name="confirm_password"
          value={form.confirm_password}
          onChange={handleChange}
          required
          minLength={8}
        />
      </label>

      <label className={labelCls}>
        Phone Number
        <input
          className={inputCls}
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls}>
        Date of Birth
        <input
          className={inputCls}
          type="date"
          name="date_of_birth"
          value={form.date_of_birth}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls}>
        Gender
        <select
          className={inputCls}
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select gender</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
        </select>
      </label>

      <label className={labelCls}>
        Exam Roll Number
        <input
          className={inputCls}
          name="exam_roll_number"
          value={form.exam_roll_number}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls} htmlFor="department_profile_id">
        Select Department
        <select
          id="department_profile_id"
          className={inputCls}
          name="department_profile_id"
          value={form.department_profile_id}
          onChange={handleChange}
          disabled={loadingDepartments}
          required
        >
          <option value="">
            {loadingDepartments
              ? "Loading departments..."
              : "Select a department"}
          </option>

          {departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.department_name} — {department.college_name} — TPO:{" "}
              {department.tpo_name}
            </option>
          ))}
        </select>
      </label>

      <label className={labelCls}>
        Degree
        <input
          className={inputCls}
          name="degree"
          value={form.degree}
          onChange={handleChange}
          required
          placeholder="B.Tech Computer Engineering"
        />
      </label>

      <label className={labelCls}>
        Batch Year
        <input
          className={inputCls}
          type="number"
          name="batch_year"
          value={form.batch_year}
          onChange={handleChange}
          required
          min="2000"
        />
      </label>

      <label className={labelCls}>
        Graduation Year
        <input
          className={inputCls}
          type="number"
          name="graduation_year"
          value={form.graduation_year}
          onChange={handleChange}
          required
          min="2000"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-7 px-4 py-3 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating account..." : "Create Student Account"}
      </button>
    </form>
  );
}
