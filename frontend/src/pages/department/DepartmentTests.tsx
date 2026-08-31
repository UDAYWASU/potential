import { useEffect, useMemo, useState } from "react";
import { getTests, releaseTest } from "../../api/tests";
import type { TestResponse, TestMode, TestStatus } from "../../api/tests";
import { Link } from "react-router-dom";

type StatusFilter = "ALL" | TestStatus;
type ModeFilter = "ALL" | TestMode;

const inputCls =
  "border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors";

const statusStyles: Record<string, string> = {
  DRAFT: "text-[#8a7a5c] border-[#c9b98f] bg-[#efe6d2]",
  RELEASED: "text-[#3f6b3f] border-[#8fae8a] bg-[#e7f0e4]",
  CLOSED: "text-[#7a3a1a] border-[#c98a5f] bg-[#f6e3d3]",
};

export default function DepartmentTests() {
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [modeFilter, setModeFilter] = useState<ModeFilter>("ALL");

  const [releasingTestId, setReleasingTestId] = useState<string | null>(null);

  async function loadTests() {
    try {
      setLoading(true);
      setError("");
      const data = await getTests();
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTests();
  }, []);

  async function handleRelease(testId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to release this test?\n\n" +
        "Releasing the test will create assignments for the students targeted by this test.",
    );

    if (!confirmed) return;

    try {
      setMessage("");
      setError("");
      setReleasingTestId(testId);

      const result = await releaseTest(testId);

      setMessage(
        `${result.message} ${result.assignments_created} student assignment${
          result.assignments_created === 1 ? "" : "s"
        } created.`,
      );

      await loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to release test.");
    } finally {
      setReleasingTestId(null);
    }
  }

  const filteredTests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesSearch =
        normalizedSearch === "" ||
        test.title.toLowerCase().includes(normalizedSearch) ||
        (test.description ?? "").toLowerCase().includes(normalizedSearch);

      const matchesStatus = statusFilter === "ALL" || test.status === statusFilter;
      const matchesMode = modeFilter === "ALL" || test.mode === modeFilter;

      return matchesSearch && matchesStatus && matchesMode;
    });
  }, [tests, search, statusFilter, modeFilter]);

  const totalTests = tests.length;
  const draftTests = tests.filter((test) => test.status === "DRAFT").length;
  const releasedTests = tests.filter((test) => test.status === "RELEASED").length;
  const closedTests = tests.filter((test) => test.status === "CLOSED").length;

  function formatDate(value: string | undefined) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  function formatMode(mode: TestMode) {
    switch (mode) {
      case "AUTOMATIC":
        return "Automatic";
      case "MANUAL":
        return "Manual";
      case "ADAPTIVE":
        return "Adaptive";
      default:
        return mode;
    }
  }

  function formatStatus(status: TestStatus) {
    switch (status) {
      case "DRAFT":
        return "Draft";
      case "RELEASED":
        return "Released";
      case "CLOSED":
        return "Closed";
      default:
        return status;
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-40 bg-[#e6ddc8] animate-pulse mb-2" />
          <div className="h-4 w-72 bg-[#e6ddc8] animate-pulse mb-10" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 border border-[#d8cbb0] bg-white/60 animate-pulse" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 border border-[#d8cbb0] bg-white/60 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-medium text-[#2b2318]">Tests</h1>
            <p className="mt-1 text-sm text-[#8a7a5c]">
              Create, release, and monitor your department assessments.
            </p>
          </div>
          <Link
            to="/department/tests/create"
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors self-start"
          >
            + Create Test
          </Link>
        </header>

        {/* Messages */}
        {message && (
          <div className="mb-6 border border-[#8fae8a] bg-[#e7f0e4] text-[#3f6b3f] text-sm px-4 py-3">
            {message}
          </div>
        )}
        {error && (
          <div role="alert" className="mb-6 border border-[#c98a5f] bg-[#f6e3d3] text-[#7a3a1a] text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Summary */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="border border-[#d8cbb0] bg-white/60 p-5">
            <div className="text-2xl font-serif font-medium text-[#2b2318]">{totalTests}</div>
            <div className="mt-1 text-xs text-[#8a7a5c]">Total Tests</div>
          </div>
          <div className="border border-[#d8cbb0] bg-white/60 p-5">
            <div className="text-2xl font-serif font-medium text-[#2b2318]">{draftTests}</div>
            <div className="mt-1 text-xs text-[#8a7a5c]">Draft</div>
          </div>
          <div className="border border-[#d8cbb0] bg-white/60 p-5">
            <div className="text-2xl font-serif font-medium text-[#2b2318]">{releasedTests}</div>
            <div className="mt-1 text-xs text-[#8a7a5c]">Released</div>
          </div>
          <div className="border border-[#d8cbb0] bg-white/60 p-5">
            <div className="text-2xl font-serif font-medium text-[#2b2318]">{closedTests}</div>
            <div className="mt-1 text-xs text-[#8a7a5c]">Closed</div>
          </div>
        </section>

        {/* Filters */}
        <section className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search tests..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className={`${inputCls} flex-1`}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className={`${inputCls} sm:w-44`}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="RELEASED">Released</option>
            <option value="CLOSED">Closed</option>
          </select>

          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value as ModeFilter)}
            className={`${inputCls} sm:w-44`}
          >
            <option value="ALL">All Modes</option>
            <option value="AUTOMATIC">Automatic</option>
            <option value="MANUAL">Manual</option>
            <option value="ADAPTIVE">Adaptive</option>
          </select>
        </section>

        {/* Test list */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c]">All Tests</h2>
              <p className="mt-1 text-xs text-[#8a7a5c]">
                {filteredTests.length} {filteredTests.length === 1 ? "test" : "tests"}
              </p>
            </div>

            <button
              type="button"
              onClick={loadTests}
              className="text-xs text-[#7a4a25] hover:underline"
            >
              Refresh
            </button>
          </div>

          {filteredTests.length === 0 ? (
            <div className="border border-[#d8cbb0] bg-white/60 text-center py-16 px-6">
              {tests.length === 0 ? (
                <>
                  <h3 className="text-base font-serif font-medium text-[#2b2318]">No tests created yet</h3>
                  <p className="mt-1.5 text-sm text-[#8a7a5c]">Create your first assessment to get started.</p>
                  <Link
                    to="/department/tests/create"
                    className="mt-6 inline-flex items-center px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
                  >
                    Create Test
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-base font-serif font-medium text-[#2b2318]">No matching tests</h3>
                  <p className="mt-1.5 text-sm text-[#8a7a5c]">Try changing your search or filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                      setModeFilter("ALL");
                    }}
                    className="mt-6 px-5 py-2.5 text-sm text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTests.map((test) => {
                const isReleasing = releasingTestId === test.id;

                return (
                  <article key={test.id} className="border border-[#d8cbb0] bg-white/60 p-6">

                    {/* Card header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          to={`/department/tests/${test.id}`}
                          className="text-base font-serif font-medium text-[#2b2318] hover:text-[#7a4a25] transition-colors"
                        >
                          {test.title}
                        </Link>
                        {test.description && (
                          <p className="mt-1 text-sm text-[#8a7a5c] leading-relaxed">{test.description}</p>
                        )}
                      </div>

                      <span
                        className={`flex-shrink-0 inline-flex items-center text-[10px] uppercase tracking-wide border px-2.5 py-1 ${
                          statusStyles[test.status] ?? statusStyles.DRAFT
                        }`}
                      >
                        {formatStatus(test.status)}
                      </span>
                    </div>

                    {/* Card meta */}
                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-[#5c4d33]">
                      <span><span className="text-[#8a7a5c]">Mode:</span> {formatMode(test.mode)}</span>
                      <span>
                        <span className="text-[#8a7a5c]">Duration:</span>{" "}
                        {test.duration_minutes ? `${test.duration_minutes} min` : "Automatic"}
                      </span>
                      <span><span className="text-[#8a7a5c]">Created:</span> {formatDate(test.created_at)}</span>
                      {test.released_at && (
                        <span><span className="text-[#8a7a5c]">Released:</span> {formatDate(test.released_at)}</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-5 flex items-center gap-3 pt-4 border-t border-[#e2d8c0]">
                      <Link
                        to={`/department/tests/${test.id}`}
                        className="px-4 py-2 text-xs text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors"
                      >
                        View Details
                      </Link>

                      {test.status === "DRAFT" && (
                        <button
                          type="button"
                          onClick={() => handleRelease(test.id)}
                          disabled={isReleasing}
                          className="px-4 py-2 text-xs tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {isReleasing ? "Releasing..." : "Release Test"}
                        </button>
                      )}

                      {test.status === "RELEASED" && (
                        <Link
                          to={`/department/tests/${test.id}/monitor`}
                          className="px-4 py-2 text-xs text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors"
                        >
                          Monitor
                        </Link>
                      )}

                      {test.status === "CLOSED" && (
                        <Link
                          to={`/department/tests/${test.id}/results`}
                          className="px-4 py-2 text-xs text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors"
                        >
                          View Results
                        </Link>
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