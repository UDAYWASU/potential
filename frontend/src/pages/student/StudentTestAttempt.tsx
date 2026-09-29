import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getStudentTestAttempt,
  saveStudentAnswer,
  submitStudentTest,
  type StudentTestAttempt as StudentTestAttemptData,
} from "../../api/student";
import { useExamProctoring } from "../../hooks/useExamProctoring";

const MAX_VIOLATIONS = 3;

type AttemptWithExpiry = StudentTestAttemptData & { expires_at?: string | null };

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
  const [deadline, setDeadline] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingAnswers = useRef<Record<string, Record<string, unknown>>>({});
  const doSubmitRef = useRef<() => Promise<void>>(async () => {});
  const autoSubmitted = useRef(false);

  const proctor = useExamProctoring({
    enabled: started && !!attempt && attempt.status !== "SUBMITTED",
    maxViolations: MAX_VIOLATIONS,
    onViolation: () => {
      // Log server-side, e.g. reportStudentViolation(assignmentId!, type, count).catch(() => {});
    },
    onLimitReached: () => {
      if (autoSubmitted.current) return;
      autoSubmitted.current = true;
      doSubmitRef.current();
    },
  });

  // Load attempt
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
        const data = (await getStudentTestAttempt(assignmentId!)) as AttemptWithExpiry;
        setAttempt(data);

        if (data.expires_at) {
          setDeadline(new Date(data.expires_at).getTime());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load test.");
      } finally {
        setLoading(false);
      }
    }

    loadAttempt();
  }, [assignmentId]);

  // Countdown: derived from a deadline so it can't drift or be reset by refresh
  useEffect(() => {
    if (!started || deadline === null || !attempt || attempt.status === "SUBMITTED") return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0 && !autoSubmitted.current) {
        autoSubmitted.current = true;
        doSubmitRef.current();
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [started, deadline, attempt?.status]);

  // Cleanup pending debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  function updateLocalAnswer(questionId: string, answer: Record<string, unknown>) {
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
  }

  const persistAnswer = useCallback(
    async (questionId: string, answer: Record<string, unknown>) => {
      if (!assignmentId) return;

      try {
        setSaving(true);
        await saveStudentAnswer(assignmentId, questionId, answer);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1200);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to save answer.");
      } finally {
        setSaving(false);
      }
    },
    [assignmentId],
  );

  function handleAnswerDebounced(questionId: string, answer: Record<string, unknown>) {
    updateLocalAnswer(questionId, answer);
    pendingAnswers.current[questionId] = answer;

    if (debounceTimers.current[questionId]) {
      clearTimeout(debounceTimers.current[questionId]);
    }

    debounceTimers.current[questionId] = setTimeout(() => {
      delete pendingAnswers.current[questionId];
      delete debounceTimers.current[questionId];
      persistAnswer(questionId, answer);
    }, 600);
  }

  function handleAnswerImmediate(questionId: string, answer: Record<string, unknown>) {
    updateLocalAnswer(questionId, answer);

    if (debounceTimers.current[questionId]) {
      clearTimeout(debounceTimers.current[questionId]);
      delete debounceTimers.current[questionId];
    }
    delete pendingAnswers.current[questionId];

    persistAnswer(questionId, answer);
  }

  async function doSubmit() {
    if (!assignmentId || submitting) return;

    try {
      setSubmitting(true);
      setError("");

      // Flush pending debounced saves so the last keystrokes aren't lost
      const pending = Object.entries(pendingAnswers.current);
      Object.values(debounceTimers.current).forEach(clearTimeout);
      debounceTimers.current = {};
      pendingAnswers.current = {};

      await Promise.all(
        pending.map(([questionId, answer]) => saveStudentAnswer(assignmentId, questionId, answer)),
      );
      await submitStudentTest(assignmentId);

      proctor.exitFullscreen();
      navigate("/student");
    } catch (err) {
      autoSubmitted.current = false;
      setError(err instanceof Error ? err.message : "Unable to submit test.");
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  }
  doSubmitRef.current = doSubmit;

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

  async function handleStart() {
    if (!attempt) return;
    // Fallback when the backend doesn't send expires_at
    if (deadline === null && attempt.duration_minutes) {
      setDeadline(Date.now() + attempt.duration_minutes * 60 * 1000);
    }
    await proctor.enterFullscreen();
    setStarted(true);
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

  // Start gate (fullscreen requires a user click)
  if (!started) {
    return (
      <div className="min-h-screen bg-[#f7f3ea] flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-[#d8cbb0] bg-white/60 p-10">
          <h1 className="text-xl font-serif font-medium text-[#2b2318]">{attempt.title}</h1>
          <ul className="mt-4 space-y-2 text-sm text-[#5c4d33] list-disc pl-5">
            <li>The test runs in full screen. Do not exit it.</li>
            <li>Switching tabs or windows is recorded as a violation.</li>
            <li>Copy, paste and right-click are disabled.</li>
            <li>After {MAX_VIOLATIONS} violations your test is submitted automatically.</li>
            {attempt.duration_minutes ? (
              <li>You have {attempt.duration_minutes} minutes. The timer cannot be paused.</li>
            ) : null}
          </ul>
          <button
            type="button"
            onClick={handleStart}
            className="mt-8 w-full px-4 py-3 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
          >
            I Understand, Start Test
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

            <span className="hidden sm:inline text-[11px] text-[#8a7a5c]">
              Violations: {proctor.violations}/{MAX_VIOLATIONS}
            </span>

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
              key={activeQuestion.question_id}
              question={activeQuestion}
              onAnswerDebounced={handleAnswerDebounced}
              onAnswerImmediate={handleAnswerImmediate}
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

      {/* Violation / fullscreen overlay */}
      {!submitting && (!proctor.isFullscreen || proctor.warning) && (
        <div className="fixed inset-0 z-[60] bg-[#2b2318] flex items-center justify-center px-6">
          <div className="max-w-sm w-full border border-[#c98a5f] bg-[#f6e3d3] p-8 text-center">
            <h2 className="text-lg font-serif font-medium text-[#7a3a1a]">Warning</h2>
            <p className="mt-3 text-sm text-[#7a3a1a]">
              {proctor.warning ?? "Full screen is required to continue the test."}
            </p>
            <p className="mt-2 text-sm text-[#7a3a1a]">
              Violations: {proctor.violations} / {MAX_VIOLATIONS}. Reaching {MAX_VIOLATIONS} submits your
              test automatically.
            </p>
            <button
              type="button"
              onClick={async () => {
                proctor.clearWarning();
                await proctor.enterFullscreen();
              }}
              className="mt-6 px-5 py-2.5 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] transition-colors"
            >
              Return to Test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type NormalizedOption = { id: string; text: string };

function pickString(...candidates: unknown[]): string | undefined {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c;
  }
  return undefined;
}

function pickOptions(...candidates: unknown[]): unknown[] {
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0) return c;
  }
  return [];
}

function normalizeOption(option: unknown, index: number): NormalizedOption {
  const letter = String.fromCharCode(65 + index);
  if (typeof option === "string") return { id: option, text: option };
  if (option && typeof option === "object") {
    const o = option as Record<string, unknown>;
    return {
      id: pickString(o["id"], o["key"]) ?? letter,
      text: pickString(o["text"], o["label"], o["value"]) ?? JSON.stringify(option),
    };
  }
  return { id: letter, text: String(option) };
}

function QuestionCard({
  question,
  onAnswerDebounced,
  onAnswerImmediate,
}: {
  question: StudentTestAttemptData["questions"][number];
  onAnswerDebounced: (questionId: string, answer: Record<string, unknown>) => void;
  onAnswerImmediate: (questionId: string, answer: Record<string, unknown>) => void;
}) {
  const content = question.question as Record<string, unknown>;

  const nested =
    typeof content["question_content"] === "object" && content["question_content"] !== null
      ? (content["question_content"] as Record<string, unknown>)
      : null;

  const questionText =
    pickString(
      nested?.["text"],
      content["text"],
      content["question"],
      typeof content["question_content"] === "string" ? content["question_content"] : undefined,
    ) ?? "Question";

  const imageUrl = pickString(nested?.["image_url"], content["image_url"]);
  const audioUrl = pickString(nested?.["audio_url"], content["audio_url"]);

  const options = pickOptions(nested?.["options"], content["options"]).map(normalizeOption);

  const questionType =
    typeof content["question_type"] === "string" ? (content["question_type"] as string) : undefined;

  const isMcq = questionType ? questionType === "MCQ" : options.length > 0;

  const currentAnswer = question.answer?.["answer"];

  return (
    <article className="border border-[#d8cbb0] bg-white/70 p-7 sm:p-9">
      <div className="flex items-center justify-between mb-6">
        <span className="text-xs tracking-[0.15em] uppercase text-[#8a7a5c]">
          Question {question.sequence_number}
        </span>
        {question.marks !== null && question.marks !== undefined && (
          <span className="text-xs text-[#8a7a5c]">
            {question.marks} mark{question.marks !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <p className="text-lg text-[#2b2318] leading-relaxed mb-4">{questionText}</p>

      {imageUrl && (
        <img
          src={imageUrl}
          alt="Question attachment"
          draggable={false}
          className="mb-5 max-h-80 border border-[#d8cbb0] object-contain"
        />
      )}

      {audioUrl && (
        <audio controls src={audioUrl} className="mb-5 w-full">
          Your browser does not support audio playback.
        </audio>
      )}

      <div className="mb-2" />

      {isMcq ? (
        options.length > 0 ? (
          <div className="space-y-3">
            {options.map((option, index) => {
              const selected = currentAnswer === option.id;

              return (
                <label
                  key={option.id}
                  className={`flex items-start gap-3 px-5 py-4 border cursor-pointer transition-colors ${
                    selected
                      ? "border-[#7a4a25] bg-[#efe6d2]"
                      : "border-[#d8cbb0] bg-white hover:bg-[#faf7ef]"
                  }`}
                >
                  <input
                    type="radio"
                    name={question.question_id}
                    value={option.id}
                    checked={selected}
                    onChange={() => onAnswerImmediate(question.question_id, { answer: option.id })}
                    className="mt-0.5 accent-[#7a4a25]"
                  />
                  <span className="text-sm text-[#2b2318] leading-relaxed">
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option.text}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-[#7a3a1a] border border-[#c98a5f] bg-[#f6e3d3] px-4 py-3">
            This question is marked as multiple choice but has no options in its data. Contact your
            department if this looks wrong.
          </p>
        )
      ) : (
        <textarea
          rows={questionType === "CODING" ? 12 : 8}
          defaultValue={typeof currentAnswer === "string" ? currentAnswer : ""}
          onChange={(event) => onAnswerDebounced(question.question_id, { answer: event.target.value })}
          placeholder={questionType === "CODING" ? "Write your code here..." : "Type your answer here..."}
          className={`select-text w-full border border-[#c9b98f] bg-white px-4 py-3 text-sm text-[#2b2318] leading-relaxed focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors resize-y ${
            questionType === "CODING" ? "font-mono" : ""
          }`}
        />
      )}
    </article>
  );
}