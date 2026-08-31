import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getDepartmentStudents } from "../../api/department";
import type { DepartmentStudent } from "../../api/department";

export default function DepartmentStudents() {
  const [students, setStudents] = useState<DepartmentStudent[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");
      const data = await getDepartmentStudents();
      setStudents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load students.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) => {
      return (
        student.full_name.toLowerCase().includes(query) ||
        student.college_email.toLowerCase().includes(query) ||
        student.exam_roll_number?.toLowerCase().includes(query)
      );
    });
  }, [students, search]);

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
        <div className="max-w-6xl mx-auto">
          <div className="h-8 w-40 bg-[#e6ddc8] animate-pulse mb-2" />
          <div className="h-4 w-72 bg-[#e6ddc8] animate-pulse mb-8" />
          <div className="h-11 w-full max-w-md bg-[#e6ddc8] animate-pulse mb-8" />
          <div className="border border-[#d8cbb0] bg-white/60 divide-y divide-[#e2d8c0]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-white/60 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-6">
        <div className="max-w-sm w-full border border-[#c98a5f] bg-[#f6e3d3] p-8 text-center">
          <h1 className="text-lg font-serif font-medium text-[#7a3a1a]">Students</h1>
          <p className="mt-2 text-sm text-[#7a3a1a]">{error}</p>
          <button
            type="button"
            onClick={loadStudents}
            className="mt-6 px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-serif font-medium text-[#2b2318]">Students</h1>
          <p className="mt-1 text-sm text-[#8a7a5c]">View students and their assessment history.</p>
        </header>

        {/* Search + count */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, email or roll number..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full sm:max-w-md border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors"
          />
          <p className="text-xs text-[#8a7a5c] flex-shrink-0">
            Showing {filteredStudents.length} of {students.length} students
          </p>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="border border-[#d8cbb0] bg-white/60 text-center py-16 px-6">
            {students.length === 0 ? (
              <p className="text-sm text-[#5c4d33]">No students are currently assigned to your department.</p>
            ) : (
              <>
                <p className="text-sm text-[#5c4d33]">No students match your search.</p>
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 text-xs text-[#7a4a25] hover:underline"
                >
                  Clear search
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block border border-[#d8cbb0] bg-white/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#d8cbb0] bg-[#efe6d2]">
                    <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">
                      Name
                    </th>
                    <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">
                      Roll Number
                    </th>
                    <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">
                      College Email
                    </th>
                    <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">
                      Degree
                    </th>
                    <th className="text-left font-medium text-[#8a7a5c] text-xs uppercase tracking-wide px-6 py-3">
                      Batch
                    </th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2d8c0]">
                  {filteredStudents.map((student) => (
                    <tr key={student.profile_id} className="hover:bg-[#efe6d2]/50 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-xs flex-shrink-0">
                            {initials(student.full_name)}
                          </div>
                          <span className="text-[#2b2318] font-medium">{student.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-[#5c4d33]">{student.exam_roll_number}</td>
                      <td className="px-6 py-3.5 text-[#5c4d33]">{student.college_email}</td>
                      <td className="px-6 py-3.5 text-[#5c4d33]">{student.degree}</td>
                      <td className="px-6 py-3.5 text-[#5c4d33]">{student.batch_year}</td>
                      <td className="px-6 py-3.5 text-right">
                        <Link
                          to={`/department/students/${student.profile_id}`}
                          className="text-xs text-[#7a4a25] hover:underline"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filteredStudents.map((student) => (
                <Link
                  key={student.profile_id}
                  to={`/department/students/${student.profile_id}`}
                  className="block border border-[#d8cbb0] bg-white/60 p-4 hover:bg-[#efe6d2]/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#7a4a25] flex items-center justify-center text-[#f3e6c9] text-xs flex-shrink-0">
                      {initials(student.full_name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#2b2318] truncate">{student.full_name}</div>
                      <div className="text-xs text-[#8a7a5c] truncate">{student.college_email}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#5c4d33]">
                    <span>{student.exam_roll_number}</span>
                    <span>{student.degree}</span>
                    <span>Batch {student.batch_year}</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}