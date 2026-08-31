import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDepartmentDashboard } from "../../api/department";
import type {
  DepartmentDashboardResponse,
  DashboardTestSummary,
} from "../../api/department";

const cardCls = "border border-[#d8cbb0] bg-white/60 p-6";

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    DRAFT: "text-[#8a7a5c] border-[#c9b98f] bg-[#efe6d2]",
    RELEASED: "text-[#3f6b3f] border-[#8fae8a] bg-[#e7f0e4]",
    CLOSED: "text-[#7a3a1a] border-[#c98a5f] bg-[#f6e3d3]",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] uppercase tracking-wide border px-2 py-0.5 ${
        styles[status] ?? "text-[#8a7a5c] border-[#c9b98f] bg-[#efe6d2]"
      }`}
    >
      {status}
    </span>
  );
}

export default function DepartmentDashboard() {
  const [dashboard, setDashboard] = useState<DepartmentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");
      const data = await getDepartmentDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-56 bg-[#e6ddc8] animate-pulse mb-2" />
          <div className="h-4 w-80 bg-[#e6ddc8] animate-pulse mb-10" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 border border-[#d8cbb0] bg-white/60 animate-pulse" />
            ))}
          </div>
          <div className="h-48 border border-[#d8cbb0] bg-white/60 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-6">
        <div className="max-w-sm w-full border border-[#c98a5f] bg-[#f6e3d3] p-8 text-center">
          <h1 className="text-lg font-serif font-medium text-[#7a3a1a]">Department Dashboard</h1>
          <p className="mt-2 text-sm text-[#7a3a1a]">{error}</p>
          <button
            type="button"
            onClick={loadDashboard}
            className="mt-6 px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  const overviewStats = [
    { label: "Total Students", value: dashboard.total_students },
    { label: "Total Tests", value: dashboard.total_tests },
    { label: "Active", value: dashboard.released_tests },
    { label: "Draft", value: dashboard.draft_tests },
    { label: "Closed", value: dashboard.closed_tests },
  ];

  const assignmentStats = [
    { label: "Total Assignments", value: dashboard.total_assignments },
    { label: "In Progress", value: dashboard.in_progress_assignments },
    { label: "Submitted", value: dashboard.submitted_assignments },
    { label: "Missed", value: dashboard.missed_assignments },
  ];

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl font-serif font-medium text-[#2b2318]">Department Dashboard</h1>
            <p className="mt-1 text-sm text-[#8a7a5c]">
              Overview of students, assessments, and test performance.
            </p>
          </div>
          <Link
            to="/department/tests/create"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors self-start"
          >
            + Create Test
          </Link>
        </header>

        {/* Overview */}
        <section className="mb-10">
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {overviewStats.map((stat) => (
              <div key={stat.label} className={cardCls}>
                <div className="text-2xl font-serif font-medium text-[#2b2318]">{stat.value}</div>
                <div className="mt-1 text-xs text-[#8a7a5c]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Assignments + Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <section className="lg:col-span-2">
            <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Assignment Overview</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {assignmentStats.map((stat) => (
                <div key={stat.label} className={cardCls}>
                  <div className="text-2xl font-serif font-medium text-[#2b2318]">{stat.value}</div>
                  <div className="mt-1 text-xs text-[#8a7a5c]">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Performance</h2>
            <div className={`${cardCls} h-[calc(100%-1.75rem)] flex flex-col justify-center`}>
              <div className="text-xs text-[#8a7a5c] mb-1">Average Percentage</div>
              <div className="text-3xl font-serif font-medium text-[#2b2318]">
                {dashboard.average_percentage !== null ? `${dashboard.average_percentage}%` : "—"}
              </div>
              {dashboard.average_percentage === null && (
                <div className="mt-1 text-xs text-[#8a7a5c]">No results released yet</div>
              )}
            </div>
          </section>
        </div>

        {/* Recent Tests */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c]">Recent Tests</h2>
            <Link to="/department/tests" className="text-xs text-[#7a4a25] hover:underline">
              View all →
            </Link>
          </div>

          {dashboard.recent_tests.length === 0 ? (
            <div className={`${cardCls} text-center py-14`}>
              <p className="text-sm text-[#5c4d33]">No tests created yet.</p>
              <Link
                to="/department/tests/create"
                className="mt-4 inline-flex items-center px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
              >
                Create your first test
              </Link>
            </div>
          ) : (
            <div className="border border-[#d8cbb0] bg-white/60 divide-y divide-[#e2d8c0]">
              {dashboard.recent_tests.map((test: DashboardTestSummary) => (
                <div
                  key={test.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 px-6 py-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-medium text-[#2b2318] truncate">{test.title}</h3>
                      <StatusPill status={test.status} />
                    </div>
                    <p className="mt-0.5 text-xs text-[#8a7a5c]">{test.mode}</p>
                  </div>

                  <div className="flex items-center gap-5 text-xs text-[#5c4d33] flex-shrink-0">
                    <div className="text-center">
                      <div className="font-medium text-[#2b2318]">{test.assigned_count}</div>
                      <div className="text-[#8a7a5c]">Assigned</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[#2b2318]">{test.submitted_count}</div>
                      <div className="text-[#8a7a5c]">Submitted</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-[#7a3a1a]">{test.missed_count}</div>
                      <div className="text-[#8a7a5c]">Missed</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}