import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface DepartmentLayoutProps {
  children: ReactNode;
}

const navigation = [
  { label: "Dashboard", path: "/department" },
  { label: "Students", path: "/department/students" },
  { label: "Tests", path: "/department/tests" },
  { label: "Test Controls", path: "/department/test-controls" },
];

export default function DepartmentLayout({ children }: DepartmentLayoutProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { logout } = useAuth();

  function isActive(path: string) {
    if (path === "/department") {
      return location.pathname === "/department";
    }

    return location.pathname.startsWith(path);
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea] lg:flex">

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between border-b border-[#d8cbb0] bg-[#f7f3ea] px-5 h-16">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-xs tracking-widest">
            P
          </div>

          <span className="text-sm font-serif font-semibold text-[#2b2318]">
            Potential
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle navigation"
          className="p-2 border border-[#c9b98f] text-[#5c4d33]"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          lg:w-64 lg:flex-shrink-0 lg:block lg:border-r lg:border-[#d8cbb0] lg:bg-[#f2ead9]
          ${mobileOpen ? "block" : "hidden"}
          border-b border-[#d8cbb0] bg-[#f2ead9]
        `}
      >
        <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col px-5 py-6">

          {/* Brand */}
          <div className="hidden lg:flex items-center space-x-3 mb-10 px-1">
            <div className="h-9 w-9 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-sm tracking-widest">
              P
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-serif font-semibold text-[#2b2318]">
                Potential
              </span>

              <span className="text-[11px] text-[#8a7a5c]">
                Department Portal
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-1">
            {navigation.map((item) => {
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 text-sm transition-colors border-l-2 ${
                    active
                      ? "border-[#7a4a25] bg-[#e6ddc8] text-[#2b2318] font-medium"
                      : "border-transparent text-[#5c4d33] hover:bg-[#e6ddc8]/60 hover:text-[#2b2318]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="mt-auto pt-6">

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#7a3a1a] border border-[#c9b98f] hover:bg-[#e6ddc8] transition-colors"
            >
              <span>Logout</span>
              <span>→</span>
            </button>

            {/* Footer */}
            <div className="mt-5 border-t border-[#d8cbb0] pt-4 text-[11px] text-[#8a7a5c] px-1">
              PRPCEM Training &amp; Placement Cell
            </div>
          </div>

        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
