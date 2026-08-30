// pages/department/TestCreationPage.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { createTest } from "../../api/tests";
import { uploadImage, uploadAudio } from "../../api/uploads";

import type {
  TestMode,
  TestRequirement,
  ManualQuestion,
  QuestionType,
} from "../../api/tests";
import { useNavigate, Link } from "react-router-dom";

const labelCls = "block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2";
const inputCls =
  "w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors";
const selectCls = inputCls;

const MODES: { value: TestMode; title: string; description: string }[] = [
  {
    value: "AUTOMATIC",
    title: "Automatic",
    description: "Set rules for subject, difficulty and count — questions are pulled from the bank.",
  },
  {
    value: "MANUAL",
    title: "Manual",
    description: "Write the exact questions yourself. Same set for every student.",
  },
  {
    value: "ADAPTIVE",
    title: "Adaptive",
    description: "Pick a subject — difficulty and length adjust per student automatically.",
  },
];

const emptyRequirement: TestRequirement = {
  subject: "",
  topic: "",
  difficulty: "EASY",
  question_type: "MCQ",
  count: 1,
  marks: 1,
};

function emptyManualQuestion(): ManualQuestion {
  return {
    question_type: "MCQ",
    subject: "",
    topic: "",
    subtopic: "",
    question_content: { text: "" },
    options: ["", "", "", ""],
    answer: { option_index: 0 },
    marks: 1,
  };
}

export default function TestCreationPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<TestMode>("AUTOMATIC");
  const [duration, setDuration] = useState("");
  const [requirements, setRequirements] = useState<TestRequirement[]>([{ ...emptyRequirement }]);

  // Manual mode state
  const [manualQuestions, setManualQuestions] = useState<ManualQuestion[]>([emptyManualQuestion()]);
  const [openQuestion, setOpenQuestion] = useState(0);

  // Adaptive mode state
  const [adaptiveSubjects, setAdaptiveSubjects] = useState<string[]>([""]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateRequirement(index: number, field: keyof TestRequirement, value: string | number) {
    setRequirements((current) =>
      current.map((requirement, i) => (i === index ? { ...requirement, [field]: value } : requirement)),
    );
  }

  function addRequirement() {
    setRequirements((current) => [...current, { ...emptyRequirement }]);
  }

  function removeRequirement(index: number) {
    setRequirements((current) => current.filter((_, i) => i !== index));
  }

  // --- Manual question helpers ---

  function updateManualQuestion(index: number, patch: Partial<ManualQuestion>) {
    setManualQuestions((current) => current.map((q, i) => (i === index ? { ...q, ...patch } : q)));
  }

  function updateQuestionContent(index: number, field: keyof ManualQuestion["question_content"], value: string) {
    setManualQuestions((current) =>
      current.map((q, i) =>
        i === index ? { ...q, question_content: { ...q.question_content, [field]: value } } : q,
      ),
    );
  }

  function updateOption(qIndex: number, optIndex: number, value: string) {
    setManualQuestions((current) =>
      current.map((q, i) => {
        if (i !== qIndex) return q;
        const options = [...(q.options ?? [])];
        options[optIndex] = value;
        return { ...q, options };
      }),
    );
  }

  function addOption(qIndex: number) {
    setManualQuestions((current) =>
      current.map((q, i) => (i === qIndex ? { ...q, options: [...(q.options ?? []), ""] } : q)),
    );
  }

  function removeOption(qIndex: number, optIndex: number) {
    setManualQuestions((current) =>
      current.map((q, i) => {
        if (i !== qIndex) return q;
        const options = (q.options ?? []).filter((_, oi) => oi !== optIndex);
        const currentAnswerIndex = q.answer.option_index ?? 0;
        return {
          ...q,
          options,
          answer: { ...q.answer, option_index: Math.min(currentAnswerIndex, options.length - 1) },
        };
      }),
    );
  }

  function handleQuestionTypeChange(index: number, type: QuestionType) {
    updateManualQuestion(index, {
      question_type: type,
      options: type === "MCQ" ? ["", "", "", ""] : undefined,
      answer: type === "MCQ" ? { option_index: 0 } : { text: "" },
    });
  }

  function addManualQuestion() {
    setManualQuestions((current) => [...current, emptyManualQuestion()]);
    setOpenQuestion(manualQuestions.length);
  }

  function removeManualQuestion(index: number) {
    setManualQuestions((current) => current.filter((_, i) => i !== index));
    setOpenQuestion(0);
  }

async function handleMediaUpload(
  index: number,
  field: "image_url" | "audio_url",
  file: File | null,
) {
  if (!file) return;

  try {
    setError("");

    const result =
      field === "image_url"
        ? await uploadImage(file)
        : await uploadAudio(file);

    updateQuestionContent(index, field, result.file_url);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unable to upload file.");
  }
}

  // --- Adaptive helpers ---

  function updateAdaptiveSubject(index: number, value: string) {
    setAdaptiveSubjects((current) => current.map((s, i) => (i === index ? value : s)));
  }

  function addAdaptiveSubject() {
    setAdaptiveSubjects((current) => [...current, ""]);
  }

  function removeAdaptiveSubject(index: number) {
    setAdaptiveSubjects((current) => current.filter((_, i) => i !== index));
  }

  const totalQuestions = requirements.reduce((sum, r) => sum + (Number(r.count) || 0), 0);
  const totalMarks = requirements.reduce((sum, r) => sum + (Number(r.marks) || 0) * (Number(r.count) || 0), 0);
  const manualTotalMarks = manualQuestions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (mode === "MANUAL" && manualQuestions.length === 0) {
        setError("Add at least one question.");
        setLoading(false);
        return;
      }

      if (mode === "ADAPTIVE" && adaptiveSubjects.filter((s) => s.trim()).length === 0) {
        setError("Add at least one subject.");
        setLoading(false);
        return;
      }

      const configuration = mode === "AUTOMATIC" ? { requirements } : undefined;

      await createTest({
        title,
        description,
        mode,
        duration_minutes: mode === "ADAPTIVE" ? undefined : Number(duration),
        configuration,
        manual_questions: mode === "MANUAL" ? manualQuestions : undefined,
        adaptive_subjects:
          mode === "ADAPTIVE" ? adaptiveSubjects.filter((s) => s.trim()) : undefined,
      });

      navigate("/department/tests");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create test.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <Link to="/department/tests" className="text-xs text-[#8a7a5c] hover:text-[#7a4a25] transition-colors">
            ← Back to Tests
          </Link>
          <h1 className="mt-3 text-2xl font-serif font-medium text-[#2b2318]">Create Test</h1>
          <p className="mt-1 text-sm text-[#8a7a5c]">Set up the test details, then choose how questions are sourced.</p>
        </div>

        {error && (
          <div role="alert" className="mb-6 border border-[#c98a5f] bg-[#f6e3d3] text-[#7a3a1a] text-sm px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Basic details */}
          <section className="border border-[#d8cbb0] bg-white/60 p-7">
            <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-5">Test Details</h2>

            <div>
              <label className={labelCls} htmlFor="title">Title</label>
              <input
                id="title"
                className={inputCls}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Aptitude Round — Batch 2026"
                required
              />
            </div>

            <div className="mt-5">
              <label className={labelCls} htmlFor="description">Description</label>
              <textarea
                id="description"
                className={inputCls}
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional notes visible to students before they start."
              />
            </div>

            {mode !== "ADAPTIVE" && (
              <div className="mt-5 max-w-xs">
                <label className={labelCls} htmlFor="duration">Duration (minutes)</label>
                <input
                  id="duration"
                  className={inputCls}
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(event) => setDuration(event.target.value)}
                  required
                />
              </div>
            )}
          </section>

          {/* Mode selector */}
          <section>
            <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Test Mode</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMode(m.value)}
                  className={`text-left border px-5 py-4 transition-colors ${
                    mode === m.value
                      ? "border-[#7a4a25] bg-[#efe6d2]"
                      : "border-[#d8cbb0] bg-white/60 hover:bg-[#efe6d2]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-serif font-medium text-[#2b2318]">{m.title}</span>
                    {mode === m.value && <span className="h-2 w-2 rounded-full bg-[#7a4a25]" />}
                  </div>
                  <p className="mt-1.5 text-xs text-[#8a7a5c] leading-relaxed">{m.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* AUTOMATIC — unchanged */}
          {mode === "AUTOMATIC" && (
            <section className="border border-[#d8cbb0] bg-white/60 p-7">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c]">Question Requirements</h2>
                <span className="text-xs text-[#8a7a5c]">
                  {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} · {totalMarks} marks
                </span>
              </div>
              <p className="text-xs text-[#8a7a5c] mb-5">
                Add one rule per group of questions. The system pulls matching questions from the bank at random.
              </p>

              <div className="space-y-4">
                {requirements.map((requirement, index) => (
                  <div key={index} className="border border-[#d8cbb0] bg-[#faf7ef] p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-[#7a4a25] tracking-wide">Rule {index + 1}</span>
                      {requirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="text-xs text-[#8a7a5c] hover:text-[#7a3a1a] transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Subject</label>
                        <input
                          className={inputCls}
                          placeholder="e.g. Quantitative Aptitude"
                          value={requirement.subject}
                          onChange={(event) => updateRequirement(index, "subject", event.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Topic</label>
                        <input
                          className={inputCls}
                          placeholder="Optional"
                          value={requirement.topic ?? ""}
                          onChange={(event) => updateRequirement(index, "topic", event.target.value)}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Difficulty</label>
                        <select
                          className={selectCls}
                          value={requirement.difficulty ?? ""}
                          onChange={(event) => updateRequirement(index, "difficulty", event.target.value)}
                        >
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Question Type</label>
                        <select
                          className={selectCls}
                          value={requirement.question_type ?? ""}
                          onChange={(event) => updateRequirement(index, "question_type", event.target.value)}
                        >
                          <option value="MCQ">MCQ</option>
                          <option value="WRITTEN">Written</option>
                          <option value="CODING">Coding</option>
                          <option value="SPOKEN">Spoken</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Number of Questions</label>
                        <input
                          className={inputCls}
                          type="number"
                          min="1"
                          value={requirement.count}
                          onChange={(event) => updateRequirement(index, "count", Number(event.target.value))}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Marks per Question</label>
                        <input
                          className={inputCls}
                          type="number"
                          min="0"
                          step="0.5"
                          value={requirement.marks ?? ""}
                          onChange={(event) => updateRequirement(index, "marks", Number(event.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addRequirement}
                className="mt-4 w-full border border-dashed border-[#c9b98f] text-sm text-[#7a4a25] py-3 hover:bg-[#efe6d2] transition-colors"
              >
                + Add Requirement
              </button>
            </section>
          )}

          {/* MANUAL — question builder */}
          {mode === "MANUAL" && (
            <section className="border border-[#d8cbb0] bg-white/60 p-7">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c]">Questions</h2>
                <span className="text-xs text-[#8a7a5c]">
                  {manualQuestions.length} question{manualQuestions.length !== 1 ? "s" : ""} · {manualTotalMarks} marks
                </span>
              </div>
              <p className="text-xs text-[#8a7a5c] mb-5">
                These questions apply only to this test — they won't be added to the question bank.
              </p>

              {/* Question list */}
              <div className="space-y-3">
                {manualQuestions.map((q, index) => {
                  const isOpen = openQuestion === index;
                  const previewText = q.question_content.text?.trim() || "Untitled question";

                  return (
                    <div key={index} className="border border-[#d8cbb0] bg-[#faf7ef]">
                      {/* Row header */}
                      <button
                        type="button"
                        onClick={() => setOpenQuestion(isOpen ? -1 : index)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="flex-shrink-0 h-6 w-6 rounded-full bg-[#7a4a25] text-[#f3e6c9] text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm text-[#2b2318] truncate">{previewText}</span>
                          <span className="flex-shrink-0 text-[10px] uppercase tracking-wide text-[#8a7a5c] border border-[#d8cbb0] px-2 py-0.5">
                            {q.question_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="text-xs text-[#8a7a5c]">{q.marks} mark{q.marks !== 1 ? "s" : ""}</span>
                          <span className="text-[#8a7a5c] text-xs">{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>

                      {/* Expanded editor */}
                      {isOpen && (
                        <div className="px-5 pb-6 pt-1 border-t border-[#d8cbb0]">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className={labelCls}>Question Type</label>
                              <select
                                className={selectCls}
                                value={q.question_type}
                                onChange={(event) =>
                                  handleQuestionTypeChange(index, event.target.value as QuestionType)
                                }
                              >
                                <option value="MCQ">MCQ</option>
                                <option value="WRITTEN">Written</option>
                                <option value="CODING">Coding</option>
                                <option value="SPOKEN">Spoken</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Marks</label>
                              <input
                                className={inputCls}
                                type="number"
                                min="0"
                                step="0.5"
                                value={q.marks}
                                onChange={(event) => updateManualQuestion(index, { marks: Number(event.target.value) })}
                              />
                            </div>
                            <div>
                              <label className={labelCls}>Subject</label>
                              <input
                                className={inputCls}
                                value={q.subject}
                                onChange={(event) => updateManualQuestion(index, { subject: event.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <label className={labelCls}>Topic</label>
                              <input
                                className={inputCls}
                                value={q.topic ?? ""}
                                onChange={(event) => updateManualQuestion(index, { topic: event.target.value })}
                              />
                            </div>
                          </div>

                          {/* Question content */}
                          <div className="mb-4">
                            <label className={labelCls}>Question Text</label>
                            <textarea
                              className={inputCls}
                              rows={3}
                              value={q.question_content.text ?? ""}
                              onChange={(event) => updateQuestionContent(index, "text", event.target.value)}
                              placeholder="Type the question here"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div>
                              <label className={labelCls}>Attach Image (optional)</label>
                              <input
                                className="text-xs text-[#5c4d33] file:mr-3 file:py-2 file:px-3 file:border file:border-[#c9b98f] file:bg-white file:text-xs file:text-[#7a4a25] file:cursor-pointer w-full border border-[#c9b98f] bg-white py-1.5"
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
  handleMediaUpload(
    index,
    "image_url",
    event.target.files?.[0] ?? null
  )
}

                              />
                              {q.question_content.audio_url && (
  <div className="mt-2">
    <audio controls className="w-full">
      <source
        src={`http://localhost:8000${q.question_content.audio_url}`}
      />
      Your browser does not support audio.
    </audio>
  </div>
)}

                            </div>
                            <div>
                              <label className={labelCls}>Attach Audio (optional)</label>
                              <input
                                className="text-xs text-[#5c4d33] file:mr-3 file:py-2 file:px-3 file:border file:border-[#c9b98f] file:bg-white file:text-xs file:text-[#7a4a25] file:cursor-pointer w-full border border-[#c9b98f] bg-white py-1.5"
                                type="file"
                                accept="audio/*"
                               onChange={(event) =>
  handleMediaUpload(
    index,
    "audio_url",
    event.target.files?.[0] ?? null
  )
}

                              />
                              {q.question_content.image_url && (
  <div className="mt-2">
    <img
      src={`http://localhost:8000${q.question_content.image_url}`}
      alt="Question attachment"
      className="max-h-40 max-w-full border border-[#d8cbb0] object-contain"
    />
  </div>
)}

                            </div>
                          </div>

                          {/* Answer section — depends on type */}
                          {q.question_type === "MCQ" ? (
                            <div>
                              <label className={labelCls}>Options — select the correct one</label>
                              <div className="space-y-2">
                                {(q.options ?? []).map((opt, optIndex) => (
                                  <div key={optIndex} className="flex items-center gap-3">
                                    <input
                                      type="radio"
                                      name={`correct-${index}`}
                                      checked={q.answer.option_index === optIndex}
                                      onChange={() =>
                                        updateManualQuestion(index, { answer: { option_index: optIndex } })
                                      }
                                      className="accent-[#7a4a25]"
                                    />
                                    <input
                                      className={inputCls}
                                      placeholder={`Option ${optIndex + 1}`}
                                      value={opt}
                                      onChange={(event) => updateOption(index, optIndex, event.target.value)}
                                    />
                                    {(q.options ?? []).length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => removeOption(index, optIndex)}
                                        className="text-xs text-[#8a7a5c] hover:text-[#7a3a1a] transition-colors"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {(q.options ?? []).length < 6 && (
                                <button
                                  type="button"
                                  onClick={() => addOption(index)}
                                  className="mt-2 text-xs text-[#7a4a25] hover:underline"
                                >
                                  + Add option
                                </button>
                              )}
                            </div>
                          ) : (
                            <div>
                              <label className={labelCls}>
                                {q.question_type === "CODING" ? "Expected Solution / Notes" : "Reference Answer"}
                              </label>
                              <textarea
                                className={inputCls}
                                rows={3}
                                value={q.answer.text ?? ""}
                                onChange={(event) =>
                                  updateManualQuestion(index, { answer: { text: event.target.value } })
                                }
                                placeholder={
                                  q.question_type === "SPOKEN"
                                    ? "Notes for evaluator on what a good spoken answer covers"
                                    : "Model answer or grading notes"
                                }
                              />
                            </div>
                          )}

                          <div className="mt-5 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeManualQuestion(index)}
                              className="text-xs text-[#8a7a5c] hover:text-[#7a3a1a] transition-colors"
                            >
                              Delete this question
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addManualQuestion}
                className="mt-4 w-full border border-dashed border-[#c9b98f] text-sm text-[#7a4a25] py-3 hover:bg-[#efe6d2] transition-colors"
              >
                + Add Question
              </button>
            </section>
          )}

          {/* ADAPTIVE */}
          {mode === "ADAPTIVE" && (
            <section className="border border-[#d8cbb0] bg-white/60 p-7">
              <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-2">Subjects</h2>
              <p className="text-xs text-[#8a7a5c] mb-5 leading-relaxed">
                Difficulty, question count and duration are set automatically per student, based on their
                past performance. You only choose which subjects this test covers.
              </p>

              <div className="space-y-2">
                {adaptiveSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      className={inputCls}
                      value={subject}
                      onChange={(event) => updateAdaptiveSubject(index, event.target.value)}
                      placeholder="e.g. Logical Reasoning"
                    />
                    {adaptiveSubjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAdaptiveSubject(index)}
                        className="text-xs text-[#8a7a5c] hover:text-[#7a3a1a] transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addAdaptiveSubject}
                className="mt-3 text-xs text-[#7a4a25] hover:underline"
              >
                + Add subject
              </button>
            </section>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : "Create Test"}
            </button>
            <Link
              to="/department/tests"
              className="px-6 py-3 text-sm text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}