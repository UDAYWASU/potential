// RegisterPage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import RoleSelector from "../components/registration/RoleSelector";
import TPORegistrationForm from "../components/registration/TPORegistrationForm";
import DepartmentRegistrationForm from "../components/registration/DepartmentRegistrationForm";
import StudentRegistrationForm from "../components/registration/StudentRegistrationForm";

type RegistrationRole = "TPO" | "DEPARTMENT" | "STUDENT";

export default function RegisterPage() {
  const [role, setRole] = useState<RegistrationRole | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  function handleSuccess(message: string) {
    setSuccessMessage(message);
  }

  if (successMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f3ea] px-6 py-16">
        <div className="w-full max-w-md border border-[#d8cbb0] bg-white/60 p-10 text-center">
          <div className="inline-flex h-11 w-11 rounded-full bg-[#7a4a25] items-center justify-center text-[#f3e6c9] text-sm tracking-widest mb-5">
            ✓
          </div>
          <h1 className="text-xl font-serif font-medium text-[#2b2318]">Registration Submitted</h1>
          <p className="mt-3 text-sm text-[#5c4d33] leading-relaxed">{successMessage}</p>

          <button
            type="button"
            onClick={() => {
              setSuccessMessage("");
              setRole(null);
            }}
            className="mt-8 w-full px-4 py-3 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f7f3ea] px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-11 w-11 rounded-full bg-[#7a4a25] items-center justify-center text-[#f3e6c9] text-sm tracking-widest mb-4">
            P
          </div>
          <h1 className="text-2xl font-serif font-medium text-[#2b2318]">
            {role ? "Create your account" : "Create your Potential account"}
          </h1>
          {!role && (
            <p className="mt-2 text-sm text-[#8a7a5c]">Select the type of account you want to register.</p>
          )}
        </div>

        {!role ? (
          <RoleSelector onSelect={setRole} />
        ) : (
          <div className="border border-[#d8cbb0] bg-white/60 p-8">
            {role === "TPO" && (
              <TPORegistrationForm onBack={() => setRole(null)} onSuccess={handleSuccess} />
            )}
            {role === "DEPARTMENT" && (
              <DepartmentRegistrationForm onBack={() => setRole(null)} onSuccess={handleSuccess} />
            )}
            {role === "STUDENT" && (
              <StudentRegistrationForm onBack={() => setRole(null)} onSuccess={handleSuccess} />
            )}
          </div>
        )}

        {!role && (
          <p className="mt-6 text-center text-sm text-[#5c4d33]">
            Already have an account?{" "}
            <Link to="/login" className="text-[#7a4a25] hover:underline">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}