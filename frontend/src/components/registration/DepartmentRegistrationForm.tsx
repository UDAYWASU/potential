import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { registerDepartment } from "../../api/auth";
import type { DepartmentRegistrationData } from "../../api/auth";
import {
  getRegistrationTPOs,
  type RegistrationTPO,
} from "../../api/registration";

interface Props {
  onBack: () => void;
  onSuccess: (message: string) => void;
}

const labelCls =
  "block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2 mt-5 first:mt-0";
const inputCls =
  "w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors";

export default function DepartmentRegistrationForm({
  onBack,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    officer_name: "",
    officer_email: "",
    officer_contact: "",
    department_name: "",
    email: "",
    password: "",
    confirm_password: "",
    tpo_profile_id: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [tpos, setTpos] = useState<RegistrationTPO[]>([]);
  const [loadingTPOs, setLoadingTPOs] = useState(true);

  useEffect(() => {
    async function loadTPOs() {
      try {
        setLoadingTPOs(true);

        const response = await getRegistrationTPOs();

        setTpos(response.tpos);
      } catch (error) {
        console.error("Failed to load TPOs:", error);
      } finally {
        setLoadingTPOs(false);
      }
    }

    loadTPOs();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.tpo_profile_id.trim()) {
      setError("TPO is required.");
      return;
    }

    setLoading(true);

    try {
      const data: DepartmentRegistrationData = {
        officer_name: form.officer_name,
        officer_email: form.officer_email,
        officer_contact: form.officer_contact,
        department_name: form.department_name,
        email: form.email,
        password: form.password,
        tpo_profile_id: form.tpo_profile_id,
      };

      const response = await registerDepartment(data);
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
          Department Registration
        </h2>

        <p className="mt-1 text-sm text-[#8a7a5c]">
          Your account will require TPO approval.
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
        Departmental T&P Officer Name
        <input
          className={inputCls}
          name="officer_name"
          value={form.officer_name}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls}>
        Officer Email
        <input
          className={inputCls}
          type="email"
          name="officer_email"
          value={form.officer_email}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls}>
        Officer Contact Number
        <input
          className={inputCls}
          name="officer_contact"
          value={form.officer_contact}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls}>
        Department Name
        <input
          className={inputCls}
          name="department_name"
          value={form.department_name}
          onChange={handleChange}
          required
        />
      </label>

      <label className={labelCls}>
        Login Email
        <input
          className={inputCls}
          type="email"
          name="email"
          value={form.email}
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

      <label className={labelCls} htmlFor="tpo_profile_id">
        Select TPO
        <select
          id="tpo_profile_id"
          className={inputCls}
          name="tpo_profile_id"
          value={form.tpo_profile_id}
          onChange={(e) =>
            setForm({
              ...form,
              tpo_profile_id: e.target.value,
            })
          }
          disabled={loadingTPOs}
          required
        >
          <option value="">
            {loadingTPOs ? "Loading TPOs..." : "Select a TPO"}
          </option>

          {tpos.map((tpo) => (
            <option key={tpo.id} value={tpo.id}>
              {tpo.officer_name} — {tpo.college_name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-7 px-4 py-3 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Submitting..." : "Create Department Account"}
      </button>
    </form>
  );
}
