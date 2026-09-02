import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getStudentProfile,
  getStudentTests,
  startStudentTest,
  type StudentProfile,
  type StudentTestAssignment,
} from "../../api/student";

const statusStyles: Record<string, string> = {
  ASSIGNED: "text-[#7a5a1a] border-[#d9b45f] bg-[#f6edd3]",
  IN_PROGRESS: "text-[#7a5a1a] border-[#d9b45f] bg-[#f6edd3]",
  SUBMITTED: "text-[#3f6b3f] border-[#8fae8a] bg-[#e7f0e4]",
  MISSED: "text-[#7a3a1a] border-[#c98a5f] bg-[#f6e3d3]",
};

function formatStatus(status: string) {
  switch (status) {
    case "ASSIGNED":
      return "Not Started";
    case "IN_PROGRESS":
      return "In Progress";
    case "SUBMITTED":
      return "Submitted";
    case "MISSED":
      return "Missed";
    default:
      return status;
  }
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [tests, setTests] = useState<StudentTestAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingTestId, setStartingTestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [profileData, testsData] = await Promise.all([
          getStudentProfile(),
          getStudentTests(),
        ]);

        if (cancelled) return;

        setProfile(profileData);
        setTests(testsData.tests);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Unable to load student dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStartTest(assignmentId: string) {
    try {
      setStartingTestId(assignmentId);
      setError("");
      await startStudentTest(assignmentId);
      navigate(`/student/tests/${assignmentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start test.");
    } finally {
      setStartingTestId(null);
    }
  }

  function handleContinueTest(assignmentId: string) {
    navigate(`/student/tests/${assignmentId}`);
  }

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
          <div className="h-9 w-64 bg-[#e6ddc8] animate-pulse mb-2" />
          <div className="h-4 w-40 bg-[#e6ddc8] animate-pulse mb-10" />
          <div className="grid grid-cols-3 gap-4 mb-10">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 border border-[#d8cbb0] bg-white/60 animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-32 border border-[#d8cbb0] bg-white/60 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !tests.length) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-6">
        <div className="max-w-sm w-full border border-[#c98a5f] bg-[#f6e3d3] p-8 text-center">
          <h1 className="text-lg font-serif font-medium text-[#7a3a1a]">Student Dashboard</h1>
          <p className="mt-2 text-sm text-[#7a3a1a]">{error}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-6 px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }

  const assignedTests = tests.filter((test) => test.status === "ASSIGNED");
  const inProgressTests = tests.filter((test) => test.status === "IN_PROGRESS");
  const completedTests = tests.filter((test) => test.status === "SUBMITTED");

  // Bring what needs action to the top: in-progress, then assigned, then the rest.
  const priority: Record<string, number> = { IN_PROGRESS: 0, ASSIGNED: 1, MISSED: 2, SUBMITTED: 3 };
  const sortedTests = [...tests].sort((a, b) => (priority[a.status] ?? 9) - (priority[b.status] ?? 9));

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-sm flex-shrink-0">
              {profile ? initials(profile.full_name) : ""}
            </div>
            <div>
              <h1 className="text-2xl font-serif font-medium text-[#2b2318]">
                Welcome, {profile?.full_name}
              </h1>
              <p className="mt-0.5 text-sm text-[#8a7a5c]">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 text-xs text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors self-start"
          >
            Logout
          </button>
        </header>

        {error && (
          <div role="alert" className="mb-6 border border-[#c98a5f] bg-[#f6e3d3] text-[#7a3a1a] text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Summary */}
        <section className="grid grid-cols-3 gap-4 mb-10">
          <div className="border border-[#d8cbb0] bg-white/60 p-5">
            <div className="text-2xl font-serif font-medium text-[#2b2318]">{assignedTests.length}</div>
            <div className="mt-1 text-xs text-[#8a7a5c]">Not Started</div>
          </div>
          <div className="border border-[#d8cbb0] bg-white/60 p-5">
            <div className="text-2xl font-serif font-medium text-[#2b2318]">{inProgressTests.length}</div>
            <div className="mt-1 text-xs text-[#8a7a5c]">In Progress</div>
          </div>
          <div className="border border-[#d8cbb0] bg-white/60 p-5">
            <div className="text-2xl font-serif font-medium text-[#2b2318]">{completedTests.length}</div>
            <div className="mt-1 text-xs text-[#8a7a5c]">Completed</div>
          </div>
        </section>

        {/* My Tests */}
        <section>
          <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">My Tests</h2>

          {tests.length === 0 ? (
            <div className="border border-[#d8cbb0] bg-white/60 text-center py-16 px-6">
              <p className="text-sm text-[#5c4d33]">You do not have any tests assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTests.map((test) => {
                const isStarting = startingTestId === test.assignment_id;
                const isUrgent = test.status === "IN_PROGRESS";

                return (
                  <article
                    key={test.assignment_id}
                    className={`border bg-white/60 p-6 ${
                      isUrgent ? "border-[#d9b45f] bg-[#faf3df]" : "border-[#d8cbb0]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-base font-serif font-medium text-[#2b2318]">{test.title}</h3>
                          <span
                            className={`inline-flex items-center text-[10px] uppercase tracking-wide border px-2 py-0.5 ${
                              statusStyles[test.status] ?? statusStyles.ASSIGNED
                            }`}
                          >
                            {formatStatus(test.status)}
                          </span>
                        </div>
                        {test.description && (
                          <p className="mt-1.5 text-sm text-[#8a7a5c] leading-relaxed">{test.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#5c4d33]">
                          <span><span className="text-[#8a7a5c]">Mode:</span> {test.mode}</span>
                          <span>
                            <span className="text-[#8a7a5c]">Duration:</span>{" "}
                            {test.duration_minutes ? `${test.duration_minutes} minutes` : "Automatic"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#e2d8c0]">
                      {test.status === "ASSIGNED" && (
                        <button
                          type="button"
                          onClick={() => handleStartTest(test.assignment_id)}
                          disabled={isStarting}
                          className="px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {isStarting ? "Starting..." : "Start Test"}
                        </button>
                      )}

                      {test.status === "IN_PROGRESS" && (
                        <button
                          type="button"
                          onClick={() => handleContinueTest(test.assignment_id)}
                          className="px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#a5731f] hover:bg-[#8f611a] transition-colors"
                        >
                          Continue Test →
                        </button>
                      )}

                      {test.status === "SUBMITTED" && (
                        <p className="text-sm text-[#3f6b3f]">Test submitted successfully.</p>
                      )}

                      {test.status === "MISSED" && (
                        <p className="text-sm text-[#7a3a1a]">This test was missed.</p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}