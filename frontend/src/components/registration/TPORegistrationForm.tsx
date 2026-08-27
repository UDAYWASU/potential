// TPORegistrationForm.tsx
import { useState } from "react";
import type { FormEvent } from "react";

import { registerTPO } from "../../api/auth";
import type { TPORegistrationData } from "../../api/auth";

interface Props {
  onBack: () => void;
  onSuccess: (message: string) => void;
}

const labelCls = "block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2 mt-5 first:mt-0";
const inputCls =
  "w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors";

export default function TPORegistrationForm({ onBack, onSuccess }: Props) {
  const [form, setForm] = useState({
    officer_name: "",
    email: "",
    password: "",
    confirm_password: "",
    college_name: "",
    college_email: "",
    contact_number: "",
    pincode: "",
    city: "",
    state: "",
    college_website: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    try {
      const data: TPORegistrationData = {
        officer_name: form.officer_name,
        email: form.email,
        password: form.password,
        college_name: form.college_name,
        college_email: form.college_email,
        contact_number: form.contact_number,
        pincode: form.pincode,
        city: form.city,
        state: form.state,
        college_website: form.college_website || undefined,
      };

      const response = await registerTPO(data);
      onSuccess(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
        <h2 className="mt-3 text-lg font-serif font-medium text-[#2b2318]">TPO Registration</h2>
        <p className="mt-1 text-sm text-[#8a7a5c]">Register your Training & Placement Office.</p>
      </div>

      {error && (
        <div role="alert" className="mb-5 border border-[#c98a5f] bg-[#f6e3d3] text-[#7a3a1a] text-sm px-4 py-3">
          {error}
        </div>
      )}

      <label className={labelCls}>
        TPO / Officer Name
        <input className={inputCls} name="officer_name" value={form.officer_name} onChange={handleChange} required />
      </label>

      <label className={labelCls}>
        Login Email
        <input className={inputCls} type="email" name="email" value={form.email} onChange={handleChange} required />
      </label>

      <label className={labelCls}>
        Password
        <input className={inputCls} type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
      </label>

      <label className={labelCls}>
        Confirm Password
        <input className={inputCls} type="password" name="confirm_password" value={form.confirm_password} onChange={handleChange} required minLength={8} />
      </label>

      <label className={labelCls}>
        Contact Number
        <input className={inputCls} name="contact_number" value={form.contact_number} onChange={handleChange} required />
      </label>

      <label className={labelCls}>
        College Name
        <input className={inputCls} name="college_name" value={form.college_name} onChange={handleChange} required />
      </label>

      <label className={labelCls}>
        College Email
        <input className={inputCls} type="email" name="college_email" value={form.college_email} onChange={handleChange} required />
      </label>

      <label className={labelCls}>
        Pincode
        <input className={inputCls} name="pincode" value={form.pincode} onChange={handleChange} required />
      </label>

      <label className={labelCls}>
        City
        <input className={inputCls} name="city" value={form.city} onChange={handleChange} required />
      </label>

      <label className={labelCls}>
        State
        <input className={inputCls} name="state" value={form.state} onChange={handleChange} required />
      </label>

      <label className={labelCls}>
        College Website
        <input
          className={inputCls}
          type="url"
          name="college_website"
          value={form.college_website}
          onChange={handleChange}
          placeholder="https://example.com"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-7 px-4 py-3 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating account..." : "Create TPO Account"}
      </button>
    </form>
  );
}