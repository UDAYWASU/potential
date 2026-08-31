import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDepartmentStudentDetail } from "../../api/department";
import type { DepartmentStudentDetail as StudentDetail } from "../../api/department";

const statusStyles: Record<string, string> = {
  ASSIGNED: "text-[#8a7a5c] border-[#c9b98f] bg-[#efe6d2]",
  IN_PROGRESS: "text-[#7a5a1a] border-[#d9b45f] bg-[#f6edd3]",
  SUBMITTED: "text-[#3f6b3f] border-[#8fae8a] bg-[#e7f0e4]",
  MISSED: "text-[#7a3a1a] border-[#c98a5f] bg-[#f6e3d3]",
};

export default function DepartmentStudentDetail() {
  const { studentId } = useParams();

  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStudent() {
    if (!studentId) {
      setError("Student ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const result = await getDepartmentStudentDetail(studentId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load student.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  function initials(name: string) {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="h-4 w-32 bg-[#e6ddc8] animate-pulse mb-6" />
          <div className="h-9 w-64 bg-[#e6ddc8] animate-pulse mb-2" />
          <div className="h-4 w-40 bg-[#e6ddc8] animate-pulse mb-10" />
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 border border-[#d8cbb0] bg-white/60 animate-pulse" />
            ))}
          </div>
          <div className="h-56 border border-[#d8cbb0] bg-white/60 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-6">
        <div className="max-w-sm w-full border border-[#c98a5f] bg-[#f6e3d3] p-8 text-center">
          <p className="text-sm text-[#7a3a1a]">{error}</p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={loadStudent}
              className="px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
            >
              Retry
            </button>
            <Link
              to="/department/students"
              className="px-5 py-2.5 text-sm text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors"
            >
              Back to Students
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-6">
        <p className="text-sm text-[#5c4d33]">Student not found.</p>
      </div>
    );
  }

  const student = data.student;
  const performance = data.performance;

  const statCards = [
    { label: "Total Tests", value: performance.total_tests },
    { label: "Completed", value: performance.completed_tests },
    { label: "In Progress", value: performance.in_progress_tests },
    { label: "Missed", value: performance.missed_tests },
    {
      label: "Average",
      value:
        performance.average_percentage !== null && performance.average_percentage !== undefined
          ? `${performance.average_percentage.toFixed(1)}%`
          : "—",
    },
  ];

  const infoFields: { label: string; value: string | number | null | undefined }[] = [
    { label: "College Email", value: student.college_email },
    { label: "Personal Email", value: student.personal_email },
    { label: "Phone", value: student.phone_number },
    { label: "Date of Birth", value: student.date_of_birth },
    { label: "Gender", value: student.gender },
    { label: "Degree", value: student.degree },
    { label: "Batch", value: student.batch_year },
    { label: "Graduation Year", value: student.graduation_year },
  ];

  function formatDateTime(value: string | null | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <Link to="/department/students" className="text-xs text-[#8a7a5c] hover:text-[#7a4a25] transition-colors">
          ← Back to Students
        </Link>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-lg flex-shrink-0">
            {initials(student.full_name)}
          </div>
          <div>
            <h1 className="text-2xl font-serif font-medium text-[#2b2318]">{student.full_name}</h1>
            <p className="mt-0.5 text-sm text-[#8a7a5c]">{student.exam_roll_number}</p>
          </div>
        </div>

        {/* Performance overview */}
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Performance Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {statCards.map((stat) => (
              <div key={stat.label} className="border border-[#d8cbb0] bg-white/60 p-5">
                <div className="text-2xl font-serif font-medium text-[#2b2318]">{stat.value}</div>
                <div className="mt-1 text-xs text-[#8a7a5c]">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Student information */}
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Student Information</h2>
          <div className="border border-[#d8cbb0] bg-white/60 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-[#e2d8c0]">
            {infoFields.map((field, i) => (
              <div
                key={field.label}
                className={`px-6 py-3.5 flex items-center justify-between sm:justify-start sm:gap-3 ${
                  i % 2 === 0 ? "sm:border-r sm:border-[#e2d8c0]" : ""
                }`}
              >
                <span className="text-xs text-[#8a7a5c] flex-shrink-0 sm:w-40">{field.label}</span>
                <span className="text-sm text-[#2b2318] text-right sm:text-left truncate">
                  {field.value || "—"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Test history */}
        <section className="mt-10">
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Test History</h2>

          {data.test_history.length === 0 ? (
            <div className="border border-[#d8cbb0] bg-white/60 text-center py-14 px-6">
              <p className="text-sm text-[#5c4d33]">This student has not been assigned any tests yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block border border-[#d8cbb0] bg-white/60 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#d8cbb0] bg-[#efe6d2]">
                      <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">Test</th>
                      <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">Mode</th>
                      <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">Status</th>
                      <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">Started</th>
                      <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">Submitted</th>
                      <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">Score</th>
                      <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2d8c0]">
                    {data.test_history.map((record) => (
                      <tr key={record.assignment_id} className="hover:bg-[#efe6d2]/50 transition-colors">
                        <td className="px-6 py-3.5">
                          <Link
                            to={`/department/tests/${record.test_id}`}
                            className="text-[#2b2318] font-medium hover:text-[#7a4a25] transition-colors"
                          >
                            {record.test_title}
                          </Link>
                        </td>
                        <td className="px-6 py-3.5 text-[#5c4d33]">{record.test_mode}</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-flex items-center text-[10px] uppercase tracking-wide border px-2 py-0.5 ${
                              statusStyles[record.status] ?? statusStyles.ASSIGNED
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-[#5c4d33]">{formatDateTime(record.started_at)}</td>
                        <td className="px-6 py-3.5 text-[#5c4d33]">{formatDateTime(record.submitted_at)}</td>
                        <td className="px-6 py-3.5 text-[#2b2318]">{record.score ?? "—"}</td>
                        <td className="px-6 py-3.5 text-[#2b2318]">
                          {record.percentage !== null && record.percentage !== undefined
                            ? `${record.percentage.toFixed(1)}%`
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3">
                {data.test_history.map((record) => (
                  <Link
                    key={record.assignment_id}
                    to={`/department/tests/${record.test_id}`}
                    className="block border border-[#d8cbb0] bg-white/60 p-4 hover:bg-[#efe6d2]/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-medium text-[#2b2318]">{record.test_title}</span>
                      <span
                        className={`flex-shrink-0 inline-flex items-center text-[10px] uppercase tracking-wide border px-2 py-0.5 ${
                          statusStyles[record.status] ?? statusStyles.ASSIGNED
                        }`}
                      >
                        {record.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5c4d33]">
                      <span>{record.test_mode}</span>
                      <span>
                        Score: {record.score ?? "—"}
                        {record.percentage !== null && record.percentage !== undefined
                          ? ` (${record.percentage.toFixed(1)}%)`
                          : ""}
                      </span>
                    </div>
                    <div className="mt-1.5 text-xs text-[#8a7a5c]">
                      Started {formatDateTime(record.started_at)} · Submitted {formatDateTime(record.submitted_at)}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}