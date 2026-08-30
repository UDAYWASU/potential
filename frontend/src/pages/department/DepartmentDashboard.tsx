
import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";

interface Test {
  id: string;
  title: string;
  mode: "AUTOMATIC" | "MANUAL" | "ADAPTIVE";
  status: "DRAFT" | "RELEASED" | "CLOSED";
  duration_minutes?: number;
  created_at: string;
  released_at?: string;
}

export default function DepartmentDashboard() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await apiRequest<Test[]>(
          "/api/tests",
        );

        setTests(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const activeTests = tests.filter(
    (test) => test.status === "RELEASED",
  );

  const draftTests = tests.filter(
    (test) => test.status === "DRAFT",
  );

  const closedTests = tests.filter(
    (test) => test.status === "CLOSED",
  );

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>

      <header>
        <h1>Department Dashboard</h1>
        <p>
          Overview of your tests and student assessments.
        </p>
      </header>

      <section>

        <div>
          <h3>Total Tests</h3>
          <strong>{tests.length}</strong>
        </div>

        <div>
          <h3>Active Tests</h3>
          <strong>{activeTests.length}</strong>
        </div>

        <div>
          <h3>Draft Tests</h3>
          <strong>{draftTests.length}</strong>
        </div>

        <div>
          <h3>Completed Tests</h3>
          <strong>{closedTests.length}</strong>
        </div>

      </section>

      <section>
        <h2>Current Tests</h2>

        {activeTests.length === 0 ? (
          <p>No active tests.</p>
        ) : (
          activeTests.map((test) => (
            <div key={test.id}>
              <h3>{test.title}</h3>

              <p>
                Mode: {test.mode}
              </p>

              <p>
                Duration:{" "}
                {test.duration_minutes ?? "Automatic"} minutes
              </p>
            </div>
          ))
        )}
      </section>

      <section>
        <h2>Recent Tests</h2>

        {tests.length === 0 ? (
          <p>No tests created yet.</p>
        ) : (
          tests.slice(0, 10).map((test) => (
            <div key={test.id}>
              <strong>{test.title}</strong>
              <span> — {test.status}</span>
            </div>
          ))
        )}
      </section>

    </div>
  );
}
