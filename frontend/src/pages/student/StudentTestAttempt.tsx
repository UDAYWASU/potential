import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getStudentTestAttempt,
  saveStudentAnswer,
  submitStudentTest,
  type StudentTestAttempt as StudentTestAttemptData,
} from "../../api/student";

export default function StudentTestAttempt() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<StudentTestAttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!assignmentId) {
      setError("Invalid test assignment.");
      setLoading(false);
      return;
    }

    async function loadAttempt() {
      try {
        setLoading(true);
        setError("");
        const data = await getStudentTestAttempt(assignmentId!);
        setAttempt(data);

        if (data.duration_minutes) {
          setSecondsLeft(data.duration_minutes * 60);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load test.");
      } finally {
        setLoading(false);
      }
    }

    loadAttempt();
  }, [assignmentId]);

  // Countdown timer
  useEffect(() => {
    if (secondsLeft === null || !attempt || attempt.status === "SUBMITTED") return;
    if (secondsLeft <= 0) {
      handleSubmit(true);
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => (s !== null ? s - 1 : s)), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft, attempt?.status]);

  async function handleAnswer(questionId: string, answer: Record<string, unknown>) {
    if (!assignmentId || !attempt) return;

    try {
      setSaving(true);
      await saveStudentAnswer(assignmentId, questionId, answer);

      setAttempt((current) => {
        if (!current) return current;
        return {
          ...current,
          questions: current.questions.map((question) =>
            question.question_id === questionId
              ? { ...question, answer, is_answered: true }
              : question,
          ),
        };
      });

      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save answer.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(auto = false) {
    if (!assignmentId) return;

    if (!auto) {
      setConfirmOpen(true);
      return;
    }

    await doSubmit();
  }

  async function doSubmit() {
    if (!assignmentId) return;

    try {
      setSubmitting(true);
      setError("");
      await submitStudentTest(assignmentId);
      navigate("/student");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit test.");
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }

  const answeredCount = useMemo(
    () => attempt?.questions.filter((q) => q.is_answered).length ?? 0,
    [attempt],
  );
  const totalCount = attempt?.questions.length ?? 0;
  const unansweredCount = totalCount - answeredCount;

  function formatTime(totalSeconds: number) {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-6">
        <p className="text-sm text-[#8a7a5c]">Preparing your test...</p>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-6">
        <div className="max-w-sm w-full border border-[#c98a5f] bg-[#f6e3d3] p-8 text-center">
          <h1 className="text-lg font-serif font-medium text-[#7a3a1a]">Unable to Open Test</h1>
          <p className="mt-2 text-sm text-[#7a3a1a]">{error}</p>
          <button
            type="button"
            onClick={() => navigate("/student")}
            className="mt-6 px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!attempt) return null;

  const submitted = attempt.status === "SUBMITTED";
  const activeQuestion = attempt.questions[activeIndex];

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-[#d8cbb0] bg-white/60 p-10 text-center">
          <div className="inline-flex h-12 w-12 rounded-full bg-[#7a4a25] items-center justify-center text-[#f3e6c9] text-lg mb-5">
            ✓
          </div>
          <h1 className="text-xl font-serif font-medium text-[#2b2318]">Test Submitted</h1>
          <p className="mt-3 text-sm text-[#5c4d33] leading-relaxed">
            Your responses for <span className="font-medium">{attempt.title}</span> have been recorded.
          </p>
          <button
            type="button"
            onClick={() => navigate("/student")}
            className="mt-8 w-full px-4 py-3 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2ead9] select-none">

      {/* Sticky exam header */}
      <header className="sticky top-0 z-30 border-b border-[#d8cbb0] bg-[#f7f3ea]/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-serif font-medium text-[#2b2318] truncate">
              {attempt.title}
            </h1>
            <p className="text-[11px] text-[#8a7a5c]">
              {attempt.mode} · {answeredCount}/{totalCount} answered
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            {saving && <span className="hidden sm:inline text-[11px] text-[#8a7a5c]">Saving…</span>}
            {!saving && savedFlash && (
              <span className="hidden sm:inline text-[11px] text-[#3f6b3f]">Saved</span>
            )}

            {secondsLeft !== null && (
              <div
                className={`px-3 py-1.5 border text-sm font-medium tabular-nums ${
                  secondsLeft <= 60
                    ? "border-[#c98a5f] bg-[#f6e3d3] text-[#7a3a1a]"
                    : "border-[#c9b98f] bg-[#efe6d2] text-[#2b2318]"
                }`}
              >
                {formatTime(secondsLeft)}
              </div>
            )}

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="px-4 py-2 text-xs tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#e2d8c0]">
          <div
            className="h-full bg-[#7a4a25] transition-all duration-300"
            style={{ width: totalCount > 0 ? `${(answeredCount / totalCount) * 100}%` : "0%" }}
          />
        </div>
      </header>

      {error && (
        <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-4">
          <div role="alert" className="border border-[#c98a5f] bg-[#f6e3d3] text-[#7a3a1a] text-sm px-4 py-3">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-8">

        {/* Question panel */}
        {activeQuestion && (
          <div className="min-w-0">
            <QuestionCard
              question={activeQuestion}
              disabled={saving}
              onAnswer={handleAnswer}
            />

            {/* Prev / Next */}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
                disabled={activeIndex === 0}
                className="px-5 py-2.5 text-sm text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Previous
              </button>

              {activeIndex < totalCount - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveIndex((i) => Math.min(totalCount - 1, i + 1))}
                  className="px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
                >
                  Review &amp; Submit
                </button>
              )}
            </div>
          </div>
        )}

        {/* Question navigator */}
        <aside className="lg:sticky lg:top-24 h-fit order-first lg:order-last">
          <div className="border border-[#d8cbb0] bg-white/60 p-5">
            <h2 className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c] mb-4">Questions</h2>
            <div className="grid grid-cols-6 lg:grid-cols-5 gap-2">
              {attempt.questions.map((q, index) => {
                const isActive = index === activeIndex;
                const isAnswered = q.is_answered;
                return (
                  <button
                    key={q.question_id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-9 w-9 text-xs flex items-center justify-center border transition-colors ${
                      isActive
                        ? "border-[#7a4a25] bg-[#7a4a25] text-[#f3e6c9]"
                        : isAnswered
                          ? "border-[#8fae8a] bg-[#e7f0e4] text-[#3f6b3f]"
                          : "border-[#c9b98f] bg-white text-[#8a7a5c]"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 text-xs text-[#5c4d33]">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 border border-[#8fae8a] bg-[#e7f0e4] inline-block" />
                Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 border border-[#c9b98f] bg-white inline-block" />
                Not answered
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Submit confirmation modal */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="submit-title"
          className="fixed inset-0 bg-[#2b2318]/50 flex items-center justify-center px-6 z-50"
        >
          <div className="max-w-sm w-full border border-[#d8cbb0] bg-[#f7f3ea] p-8">
            <h2 id="submit-title" className="text-lg font-serif font-medium text-[#2b2318]">
              Submit this test?
            </h2>
            <p className="mt-3 text-sm text-[#5c4d33] leading-relaxed">
              You've answered {answeredCount} of {totalCount} questions.
              {unansweredCount > 0 && (
                <span className="block mt-1.5 text-[#7a3a1a]">
                  {unansweredCount} question{unansweredCount !== 1 ? "s" : ""} still unanswered.
                </span>
              )}
            </p>
            <p className="mt-3 text-sm text-[#5c4d33]">
              You won't be able to change your answers after submitting.
            </p>

            <div className="mt-7 flex items-center gap-3">
              <button
                type="button"
                onClick={() => doSubmit()}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Test"}
              </button>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 text-sm text-[#5c4d33] border border-[#c9b98f] hover:bg-[#efe6d2] transition-colors"
              >
                Continue Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  disabled,
  onAnswer,
}: {
  question: StudentTestAttemptData["questions"][number];
  disabled: boolean;
  onAnswer: (
    questionId: string,
    answer: Record<string, unknown>,
  ) => void;
}) {
  const content = question.question;

  /*
   * ============================================================
   * QUESTION CONTENT
   * ============================================================
   *
   * Manual:
   *
   * {
   *   question_content: {
   *     text: "what is normalization?"
   *   }
   * }
   *
   * Automatic may have a different snapshot structure.
   */

  const questionContent =
    content["question_content"];

  let questionText = "Question";

  if (
    typeof questionContent === "object" &&
    questionContent !== null &&
    "text" in questionContent &&
    typeof questionContent.text === "string"
  ) {
    questionText = questionContent.text;
  } else if (
    typeof content["text"] === "string"
  ) {
    questionText = content["text"];
  } else if (
    typeof content["question"] === "string"
  ) {
    questionText = content["question"];
  } else if (
    typeof content["question_content"] === "string"
  ) {
    questionText = content["question_content"];
  }


  /*
   * ============================================================
   * OPTIONS
   * ============================================================
   */

  let options: unknown[] = [];

  if (
    Array.isArray(content["options"])
  ) {
    options = content["options"];
  }

  if (
    options.length === 0 &&
    typeof questionContent === "object" &&
    questionContent !== null &&
    "options" in questionContent &&
    Array.isArray(questionContent.options)
  ) {
    options = questionContent.options;
  }


  /*
   * ============================================================
   * CURRENT ANSWER
   * ============================================================
   */

  const currentAnswer =
    question.answer?.["answer"];


  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <article>

      <h2>
        Question {question.sequence_number}
      </h2>


      <p>
        {questionText}
      </p>


      {question.marks !== null &&
        question.marks !== undefined && (

          <p>
            Marks: {question.marks}
          </p>

        )}


      {/* ======================================================
          MCQ / OPTIONS
      ====================================================== */}

      {options.length > 0 ? (

        <div>

          {options.map(
            (option, index) => {

              const value =
                typeof option === "string"
                  ? option
                  : JSON.stringify(option);

              const selected =
                currentAnswer === value;

              return (

                <label
                  key={index}
                  style={{
                    display: "block",
                    marginBottom: "8px",
                  }}
                >

                  <input
                    type="radio"
                    name={question.question_id}
                    value={value}
                    checked={selected}
                    disabled={disabled}
                    onChange={() =>
                      onAnswer(
                        question.question_id,
                        {
                          answer: value,
                        },
                      )
                    }
                  />

                  {" "}

                  {value}

                </label>

              );

            },
          )}

        </div>

      ) : (

        /* ====================================================
           WRITTEN / MANUAL QUESTION
           ==================================================== */

        <textarea
          rows={6}
          disabled={disabled}
          value={
            typeof currentAnswer === "string"
              ? currentAnswer
              : ""
          }
          onChange={(event) =>
            onAnswer(
              question.question_id,
              {
                answer: event.target.value,
              },
            )
          }
        />

      )}

    </article>
  );
}