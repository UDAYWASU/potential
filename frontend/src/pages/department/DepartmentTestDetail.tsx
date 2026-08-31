import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getTestDetail,
  getTestMonitor,
} from "../../api/tests";

import type {
  DepartmentTestDetail as TestDetail,
  DepartmentTestMonitor as TestMonitor,
} from "../../api/tests";

export default function DepartmentTestDetail() {
  const { testId } = useParams();

  const [test, setTest] = useState<TestDetail | null>(null);
  const [monitor, setMonitor] = useState<TestMonitor | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    if (!testId) return;

    try {
      setLoading(true);
      setError("");

      const [testData, monitorData] = await Promise.all([
        getTestDetail(testId),
        getTestMonitor(testId),
      ]);

      setTest(testData);
      setMonitor(monitorData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load test.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [testId]);

  if (loading) {
    return <div>Loading test...</div>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <Link to="/department/tests">
          Back to Tests
        </Link>
      </div>
    );
  }

  if (!test || !monitor) {
    return <div>Test not found.</div>;
  }

  return (
    <div>

      <header>
        <Link to="/department/tests">
          ← Back to Tests
        </Link>

        <h1>{test.title}</h1>

        {test.description && (
          <p>{test.description}</p>
        )}

        <p>
          {test.mode} · {test.status}
        </p>
      </header>

      <section>
        <h2>Test Overview</h2>

        <div>
          <strong>{test.question_count}</strong>
          <span> Questions</span>
        </div>

        <div>
          <strong>{test.assigned_count}</strong>
          <span> Assigned</span>
        </div>

        <div>
          <strong>{test.in_progress_count}</strong>
          <span> In Progress</span>
        </div>

        <div>
          <strong>{test.submitted_count}</strong>
          <span> Submitted</span>
        </div>

        <div>
          <strong>{test.missed_count}</strong>
          <span> Missed</span>
        </div>
      </section>

      <section>
        <h2>Student Monitoring</h2>

        {monitor.students.length === 0 ? (
          <p>
            No students have been assigned to this test yet.
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
                <th>Started</th>
                <th>Submitted</th>
              </tr>
            </thead>

            <tbody>
              {monitor.students.map((student) => (
                <tr key={student.assignment_id}>

                  <td>
                    {student.student_name}
                  </td>

                  <td>
                    {student.status}
                  </td>

                  <td>
                    {student.started_at
                      ? new Date(
                          student.started_at,
                        ).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    {student.submitted_at
                      ? new Date(
                          student.submitted_at,
                        ).toLocaleString()
                      : "—"}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

    </div>
  );
}