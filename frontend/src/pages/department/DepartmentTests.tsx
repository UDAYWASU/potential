
import { useEffect, useState } from "react";
import {
  getTests,
  releaseTest
} from "../../api/tests";
import type {TestResponse} from "../../api/tests";
import { Link } from "react-router-dom";

export default function DepartmentTests() {
  const [tests, setTests] = useState<TestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadTests() {
    try {
      setLoading(true);

      const data = await getTests();

      setTests(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load tests.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTests();
  }, []);

  async function handleRelease(testId: string) {
    try {
      setMessage("");
      setError("");

      const result = await releaseTest(testId);

      setMessage(
        `${result.message} ${result.assignments_created} student assignments created.`,
      );

      await loadTests();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to release test.",
      );
    }
  }

  if (loading) {
    return <div>Loading tests...</div>;
  }

  return (
    <div>

      <header>
        <h1>Tests</h1>

        <Link to="/department/tests/create">
          Create Test
        </Link>
      </header>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}

      {tests.length === 0 ? (
        <p>No tests created yet.</p>
      ) : (
        <div>

          {tests.map((test) => (
            <div key={test.id}>

              <h3>{test.title}</h3>

              <p>
                Mode: {test.mode}
              </p>

              <p>
                Status: {test.status}
              </p>

              {test.duration_minutes && (
                <p>
                  Duration: {test.duration_minutes} minutes
                </p>
              )}

              {test.status === "DRAFT" && (
                <button
                  type="button"
                  onClick={() =>
                    handleRelease(test.id)
                  }
                >
                  Release Test
                </button>
              )}

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
