import { useEffect, useState } from "react";
import { closeTest, getTests } from "../../api/tests";
import type { TestResponse } from "../../api/tests";

const statusStyles: Record<string, string> = {
  DRAFT: "text-[#8a7a5c] border-[#c9b98f] bg-[#efe6d2]",
  RELEASED: "text-[#3f6b3f] border-[#8fae8a] bg-[#e7f0e4]",
  CLOSED: "text-[#7a3a1a] border-[#c98a5f] bg-[#f6e3d3]",
};

export default function DepartmentTestControls() {
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [underConstruction, setUnderConstruction] = useState(false);
  const [closingTestId, setClosingTestId] = useState<string | null>(null);

  async function loadTests() {
    try {
      setLoading(true);
      setError("");
      const data = await getTests();
      setTests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load test controls.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTests();
  }, []);

  async function handleCloseTest(testId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to close this test?\n\nStudents will no longer be able to continue taking it.",
    );

    if (!confirmed) return;

    try {
      setClosingTestId(testId);
      setError("");
      setMessage("");

      const result = await closeTest(testId);
      setMessage(result.message);

      await loadTests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to close test.");
    } finally {
      setClosingTestId(null);
    }
  }

  function handleReleaseResult() {
    setUnderConstruction(true);
  }

  // Group tests so released tests (the ones with actual controls) surface first
  const releasedTests = tests.filter((t) => t.status === "RELEASED");
  const otherTests = tests.filter((t) => t.status !== "RELEASED");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="h-8 w-48 bg-[#e6ddc8] animate-pulse mb-2" />
          <div className="h-4 w-80 bg-[#e6ddc8] animate-pulse mb-10" />
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
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-serif font-medium text-[#2b2318]">Test Controls</h1>
          <p className="mt-1 text-sm text-[#8a7a5c]">
            Manage released tests, result publication, and test closure.
          </p>
        </header>

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

        {tests.length === 0 ? (
          <div className="border border-[#d8cbb0] bg-white/60 text-center py-16 px-6">
            <p className="text-sm text-[#5c4d33]">No tests are available.</p>
          </div>
        ) : (
          <div className="space-y-8">

            {releasedTests.length > 0 && (
              <section>
                <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Active Controls</h2>
                <div className="space-y-3">
                  {releasedTests.map((test) => (
                    <div key={test.id} className="border border-[#d8cbb0] bg-white/60 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="text-base font-serif font-medium text-[#2b2318]">{test.title}</h3>
                          <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#5c4d33]">
                            <span><span className="text-[#8a7a5c]">Mode:</span> {test.mode}</span>
                            {test.duration_minutes && (
                              <span><span className="text-[#8a7a5c]">Duration:</span> {test.duration_minutes} min</span>
                            )}
                          </div>
                        </div>
                        <span
                          className={`flex-shrink-0 inline-flex items-center text-[10px] uppercase tracking-wide border px-2.5 py-1 ${statusStyles.RELEASED}`}
                        >
                          Released
                        </span>
                      </div>

                      <div className="mt-5 flex items-center gap-3 pt-4 border-t border-[#e2d8c0]">
                        <button
                          type="button"
                          onClick={handleReleaseResult}
                          className="px-4 py-2 text-xs text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors"
                        >
                          Release Result
                        </button>
                        <button
                          type="button"
                          disabled={closingTestId === test.id}
                          onClick={() => handleCloseTest(test.id)}
                          className="px-4 py-2 text-xs tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {closingTestId === test.id ? "Closing..." : "Close Test"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {otherTests.length > 0 && (
              <section>
                <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Other Tests</h2>
                <div className="space-y-3">
                  {otherTests.map((test) => (
                    <div
                      key={test.id}
                      className="border border-[#d8cbb0] bg-white/60 p-6 flex items-center justify-between gap-4"
                    >
                      <div>
                        <h3 className="text-sm font-medium text-[#2b2318]">{test.title}</h3>
                        <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#5c4d33]">
                          <span><span className="text-[#8a7a5c]">Mode:</span> {test.mode}</span>
                          {test.duration_minutes && (
                            <span><span className="text-[#8a7a5c]">Duration:</span> {test.duration_minutes} min</span>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-[#8a7a5c]">
                          {test.status === "DRAFT"
                            ? "Release this test before using test controls."
                            : "This test is closed."}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 inline-flex items-center text-[10px] uppercase tracking-wide border px-2.5 py-1 ${
                          statusStyles[test.status] ?? statusStyles.DRAFT
                        }`}
                      >
                        {test.status.charAt(0) + test.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Under construction modal */}
      {underConstruction && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="under-construction-title"
          className="fixed inset-0 bg-[#2b2318]/40 flex items-center justify-center px-6 z-50"
        >
          <div className="max-w-sm w-full border border-[#d8cbb0] bg-[#f7f3ea] p-8">
            <h2 id="under-construction-title" className="text-lg font-serif font-medium text-[#2b2318]">
              Result Release
            </h2>
            <p className="mt-3 text-sm text-[#5c4d33] leading-relaxed">
              Result release is currently under development.
            </p>
            <p className="mt-2 text-sm text-[#5c4d33] leading-relaxed">
              This feature will be available in a future update.
            </p>
            <button
              type="button"
              onClick={() => setUnderConstruction(false)}
              className="mt-6 w-full px-4 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}