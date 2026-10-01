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
        <div className="w-full max-w-md rounded-[24px] border border-[#d8cbb0] bg-white/70 p-10 text-center shadow-[0_20px_60px_rgba(80,55,25,0.06)]">
          <div className="inline-flex h-11 w-11 rounded-full bg-[#7a4a25] items-center justify-center text-[#f3e6c9] text-sm tracking-widest mb-5">
            ✓
          </div>

          <h1 className="text-xl font-serif font-medium text-[#2b2318]">
            Registration Submitted
          </h1>

          <p className="mt-3 text-sm text-[#5c4d33] leading-relaxed">
            {successMessage}
          </p>

          <button
            type="button"
            onClick={() => {
              setSuccessMessage("");
              setRole(null);
            }}
            className="mt-8 w-full h-12 px-4 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] rounded-[16px] shadow-[0_8px_20px_rgba(122,74,37,0.14)] hover:shadow-[0_10px_24px_rgba(122,74,37,0.20)] transition-all duration-200"
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  /*
   * Keep role selection compact.
   * Once a role is selected, expand the page so the
   * registration forms have enough breathing room.
   */
  const pageWidth = role === "STUDENT" ? "max-w-7xl" : role ? "max-w-3xl" : "max-w-md";

  return (
    <div className="min-h-screen bg-[#f7f3ea] px-4 sm:px-6 py-10 sm:py-16">
      <div className={`w-full ${pageWidth} mx-auto transition-all duration-300`}>
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-11 w-11 rounded-full bg-[#7a4a25] items-center justify-center text-[#f3e6c9] text-sm tracking-widest mb-4 shadow-[0_6px_18px_rgba(122,74,37,0.12)]">
            P
          </div>

          <h1 className="text-2xl font-serif font-medium text-[#2b2318]">
            {role
              ? "Create your account"
              : "Create your Potential account"}
          </h1>

          {!role && (
            <p className="mt-2 text-sm text-[#8a7a5c]">
              Select the type of account you want to register.
            </p>
          )}
        </div>

        {/* Registration Content */}
        {!role ? (
          <RoleSelector onSelect={setRole} />
        ) : (
          <div
            className={`border border-[#d8cbb0] bg-white/60 rounded-[24px] shadow-[0_20px_60px_rgba(80,55,25,0.06)] ${
              role === "STUDENT" ? "p-5 sm:p-7 lg:p-8" : "p-8"
            }`}
          >
            {role === "TPO" && (
              <TPORegistrationForm
                onBack={() => setRole(null)}
                onSuccess={handleSuccess}
              />
            )}

            {role === "DEPARTMENT" && (
              <DepartmentRegistrationForm
                onBack={() => setRole(null)}
                onSuccess={handleSuccess}
              />
            )}

            {role === "STUDENT" && (
              <StudentRegistrationForm
                onBack={() => setRole(null)}
                onSuccess={handleSuccess}
              />
            )}
          </div>
        )}

        {/* Login Link */}
        {!role && (
          <p className="mt-6 text-center text-sm text-[#5c4d33]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-[#7a4a25] hover:text-[#63391b] hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
