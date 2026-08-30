
import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";

interface DepartmentLayoutProps {
  children: ReactNode;
}

export default function DepartmentLayout({
  children,
}: DepartmentLayoutProps) {
  const location = useLocation();

  const navigation = [
    {
      label: "Dashboard",
      path: "/department",
    },
    {
      label: "Students",
      path: "/department/students",
    },
    {
      label: "Tests",
      path: "/department/tests",
    },
    {
      label: "Test Controls",
      path: "/department/test-controls",
    },
  ];

  return (
    <div className="department-layout">

      <aside className="department-sidebar">

        <div className="department-brand">
          Potential
        </div>

        <nav>
          {navigation.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={
                location.pathname === item.path
                  ? "nav-item active"
                  : "nav-item"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

      </aside>

      <main className="department-main">
        {children}
      </main>

    </div>
  );
}