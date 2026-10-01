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
  "block text-[11px] font-medium tracking-[0.12em] uppercase text-[#8a7a5c] mb-2";

const inputCls =
  "w-full h-11 border border-[#d8ccb0] bg-[#fffdfa] px-4 text-sm text-[#2b2318] rounded-[15px] focus:outline-none focus:border-[#7a4a25] focus:ring-4 focus:ring-[#7a4a25]/[0.07] transition-all duration-200 placeholder:text-[#b5aa94]";


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

const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

const passwordRequirements = {
  minLength: form.password.length >= 8,
  uppercase: /[A-Z]/.test(form.password),
  lowercase: /[a-z]/.test(form.password),
  number: /[0-9]/.test(form.password),
  special: /[^A-Za-z0-9]/.test(form.password),
};

const passwordIsValid =
  passwordRequirements.minLength &&
  passwordRequirements.uppercase &&
  passwordRequirements.lowercase &&
  passwordRequirements.number &&
  passwordRequirements.special;

const passwordsMatch =
  form.confirm_password.length > 0 &&
  form.password === form.confirm_password;
const [degreeType, setDegreeType] = useState("");
const [degreeSpecialization, setDegreeSpecialization] = useState("");
const [otherDegree, setOtherDegree] = useState("");


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
  <form onSubmit={handleSubmit} className="w-full">
    {/* Header */}
    <div className="mb-7">
      <button
        type="button"
        onClick={onBack}
        className="group text-xs text-[#8a7a5c] hover:text-[#7a4a25] transition-colors"
      >
        <span className="inline-block mr-1 transition-transform duration-200 group-hover:-translate-x-0.5">
          ←
        </span>
        Change account type
      </button>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-medium tracking-tight text-[#2b2318]">
            Student Registration
          </h2>

          <p className="mt-1.5 text-sm text-[#8a7a5c]">
            Create your student account and get started.
          </p>
        </div>

        <div className="hidden sm:block text-right">
          <span className="text-[10px] uppercase tracking-[0.16em] text-[#b0a184]">
            Registration
          </span>
          <div className="mt-1 text-xs text-[#7a4a25]">
            Student Account
          </div>
        </div>
      </div>
    </div>

    {/* Error */}
    {error && (
      <div
        role="alert"
        className="mb-5 rounded-[14px] border border-[#c98a5f] bg-[#f6e3d3] text-[#7a3a1a] text-sm px-4 py-3"
      >
        {error}
      </div>
    )}

    {/* Main Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* PERSONAL INFORMATION */}
      <section className="rounded-[20px] border border-[#e2d8c2] bg-[#fcfaf5] p-5">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#a08e6d]">
            01
          </p>

          <h3 className="mt-1 text-base font-serif text-[#2b2318]">
            Personal Information
          </h3>

          <p className="mt-1 text-xs text-[#9a8c74]">
            Your basic contact details.
          </p>
        </div>

        <div className="space-y-4">
          <label className={labelCls}>
            Full Name
            <input
              className={inputCls}
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your full name"
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
    placeholder="name@example.com"
    autoComplete="email"
    required
  />
<div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#7a4a25]">
  <span className="h-1.5 w-1.5 rounded-full bg-[#7a4a25]" />
  <span>Used to sign in to your account</span>
</div>

</label>

<label className={labelCls}>
  College Email
  <input
    className={inputCls}
    type="email"
    name="college_email"
    value={form.college_email}
    onChange={handleChange}
    placeholder="name@college.edu"
    autoComplete="organization"
    required
  />
  <p className="mt-1.5 text-[11px] text-[#a08e6d]">
    Your institutional purposes.
  </p>
</label>


<label className={labelCls}>
  Phone Number

  <div
    className={`flex h-11 overflow-hidden rounded-[15px] border bg-[#fffdfa] transition-all duration-200 ${
      form.phone_number && form.phone_number.length === 10
        ? "border-green-600 focus-within:ring-4 focus-within:ring-green-600/[0.07]"
        : "border-[#d8ccb0] focus-within:border-[#7a4a25] focus-within:ring-4 focus-within:ring-[#7a4a25]/[0.07]"
    }`}
  >
    <span className="flex items-center px-3 text-sm text-[#7a4a25] border-r border-[#e2d8c2] bg-[#f8f3e8]">
      +91
    </span>

    <input
      className="min-w-0 flex-1 bg-transparent px-3 text-sm text-[#2b2318] focus:outline-none placeholder:text-[#b5aa94]"
      type="tel"
      name="phone_number"
      value={form.phone_number}
      onChange={(e) => {
        const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);

        setForm({
          ...form,
          phone_number: digitsOnly,
        });
      }}
      placeholder="9876543210"
      inputMode="numeric"
      autoComplete="tel"
      maxLength={10}
      required
      aria-describedby="phone-help"
    />
  </div>

  {form.phone_number.length > 0 &&
    form.phone_number.length < 10 && (
      <p id="phone-help" className="mt-1.5 text-[11px] text-[#a08e6d]">
        Enter {10 - form.phone_number.length} more digit
        {10 - form.phone_number.length !== 1 ? "s" : ""}.
      </p>
    )}

  {form.phone_number.length === 10 && (
    <p className="mt-1.5 text-[11px] text-green-700">
      ✓ Valid 10-digit mobile number
    </p>
  )}
</label>


          <div className="grid grid-cols-2 gap-3">
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
                <option value="">Select</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">
                  Prefer not to say
                </option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* ACADEMIC INFORMATION */}
      <section className="rounded-[20px] border border-[#e2d8c2] bg-[#fcfaf5] p-5">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#a08e6d]">
            02
          </p>

          <h3 className="mt-1 text-base font-serif text-[#2b2318]">
            Academic Information
          </h3>

          <p className="mt-1 text-xs text-[#9a8c74]">
            Your college and academic details.
          </p>
        </div>

        <div className="space-y-4">
          <label className={labelCls}>
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
                  {department.department_name} —{" "}
                  {department.college_name} — TPO:{" "}
                  {department.tpo_name}
                </option>
              ))}
            </select>
          </label>

<div>
  <label className={labelCls}>
    Degree
  </label>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {/* Degree Type */}
    <select
      className={inputCls}
      value={degreeType}
      onChange={(e) => {
        const value = e.target.value;

        setDegreeType(value);
        setDegreeSpecialization("");
        setOtherDegree("");

        if (value === "OTHER") {
          setForm({
            ...form,
            degree: "",
          });
        } else {
          setForm({
            ...form,
            degree: "",
          });
        }
      }}
      required
    >
      <option value="">Select degree</option>
      <option value="B.Tech">B.Tech</option>
      <option value="B.S">B.S</option>
      <option value="M.Tech">M.Tech</option>
      <option value="M.S">M.S</option>
      <option value="OTHER">Other</option>
    </select>

    {/* Specialization */}
    {degreeType && degreeType !== "OTHER" ? (
      <select
        className={inputCls}
        value={degreeSpecialization}
        onChange={(e) => {
          const specialization = e.target.value;

          setDegreeSpecialization(specialization);

          setForm({
            ...form,
            degree: specialization
              ? `${degreeType} ${specialization}`
              : "",
          });
        }}
        required
      >
        <option value="">Select specialization</option>

        <option value="Artificial Intelligence and Data Science">
          AI & Data Science
        </option>
        <option value="Robotics and Automation">Robotics & Automation</option>
 
        <option value="Computer Engineering">
          Computer Engineering
        </option>

        <option value="Machine Learning">
          Machine Learning
        </option>

        <option value="Information Technology">
          Information Technology
        </option>

        <option value="Electronics and Communication Engineering">
          Electronics & Communication
        </option>

        <option value="Electrical Engineering">
          Electrical Engineering
        </option>

        <option value="Mechanical Engineering">
          Mechanical Engineering
        </option>

        <option value="Civil Engineering">
          Civil Engineering
        </option>



        <option value="Data Science">
          Data Science
        </option>

        <option value="Cyber Security">
          Cyber Security
        </option>

        <option value="Other">
          Other
        </option>
      </select>
    ) : degreeType === "OTHER" ? (
      <input
        className={inputCls}
        value={otherDegree}
        onChange={(e) => {
          const value = e.target.value;

          setOtherDegree(value);

          setForm({
            ...form,
            degree: value,
          });
        }}
        placeholder="Enter your degree"
        required
      />
    ) : (
      <div className="hidden sm:block" />
    )}
  </div>

  {/* Small preview of what will be submitted */}
  {form.degree && (
    <p className="mt-2 text-[11px] text-[#a08e6d]">
      Degree:{" "}
      <span className="text-[#7a4a25]">
        {form.degree}
      </span>
    </p>
  )}
</div>


          <label className={labelCls}>
            Exam Roll Number
            <input
              className={inputCls}
              name="exam_roll_number"
              value={form.exam_roll_number}
              onChange={handleChange}
              placeholder="Enter roll number"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
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
                placeholder="2022"
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
                placeholder="2026"
              />
            </label>
          </div>
        </div>
      </section>

      {/* ACCOUNT SECURITY */}
      <section className="rounded-[20px] border border-[#e2d8c2] bg-[#fcfaf5] p-5">
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#a08e6d]">
            03
          </p>

          <h3 className="mt-1 text-base font-serif text-[#2b2318]">
            Account Security
          </h3>

          <p className="mt-1 text-xs text-[#9a8c74]">
            Choose a secure password.
          </p>
        </div>

        <div className="space-y-4">
          <label className={labelCls}>
            Password

            <div className="relative">
              <input
                className={`${inputCls} pr-16 ${
                  form.password && passwordIsValid
                    ? "border-green-600 focus:border-green-600 focus:ring-green-600"
                    : ""
                }`}
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#7a4a25] hover:text-[#63391b] transition-colors"
                aria-label={
                  showPassword ? "Hide password" : "Show password"
                }
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {form.password && !passwordIsValid && (
              <div className="mt-2.5 text-xs text-[#8a7a5c]">
                <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[#a08e6d]">
                  Still needed
                </p>

                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {!passwordRequirements.minLength && (
                    <span>• 8+ characters</span>
                  )}

                  {!passwordRequirements.uppercase && (
                    <span>• Uppercase</span>
                  )}

                  {!passwordRequirements.lowercase && (
                    <span>• Lowercase</span>
                  )}

                  {!passwordRequirements.number && (
                    <span>• Number</span>
                  )}

                  {!passwordRequirements.special && (
                    <span>• Special character</span>
                  )}
                </div>
              </div>
            )}

            {form.password && passwordIsValid && (
              <p className="mt-2 text-xs text-green-700">
                ✓ Password requirements met
              </p>
            )}
          </label>

          <label className={labelCls}>
            Confirm Password

            <div className="relative">
              <input
                className={`${inputCls} pr-16 ${
                  form.confirm_password
                    ? passwordsMatch
                      ? "border-green-600 focus:border-green-600 focus:ring-green-600"
                      : "border-red-400 focus:border-red-400 focus:ring-red-400"
                    : ""
                }`}
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                required
                minLength={8}
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#7a4a25] hover:text-[#63391b] transition-colors"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>

            {form.confirm_password && (
              <p
                className={`mt-2 text-xs ${
                  passwordsMatch
                    ? "text-green-700"
                    : "text-red-600"
                }`}
              >
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "Passwords do not match"}
              </p>
            )}
          </label>

          <div className="mt-2 rounded-[14px] bg-[#f4efe3] px-3.5 py-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-[#a08e6d]">
              Account
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#8a7a5c]">
              Your account can be used immediately after registration.
            </p>
          </div>
        </div>
      </section>
    </div>

    {/* Footer */}
    <div className="mt-5 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
      <p className="text-[11px] text-[#a08e6d]">
        By creating an account, you agree to provide accurate information.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="sm:min-w-[220px] h-12 px-6 text-sm font-medium tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] rounded-[16px] shadow-[0_8px_20px_rgba(122,74,37,0.14)] hover:shadow-[0_10px_24px_rgba(122,74,37,0.20)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? "Creating account..." : "Create Student Account"}
      </button>
    </div>
  </form>
);

}
