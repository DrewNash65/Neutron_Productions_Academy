"use client";

import { useState } from "react";

type Module = {
  id: string;
  slug: string;
  title: string;
  description: string;
  orderIndex: number;
  published: boolean;
  comingSoon: boolean;
  _count: { lessons: number };
};

type Lesson = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  moduleId: string;
  published: boolean;
  estimatedMinutes: number;
  difficulty: number;
  module: { title: string; slug: string };
  _count: { exercises: number; quizQuestions: number };
};

type QuizQuestion = {
  id: string;
  lessonId: string;
  question: string;
  type: string;
  options: string | null;
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
  lesson: { title: string; slug: string; id: string };
};

type QuizFormState = {
  questionId?: string;
  lessonId: string;
  question: string;
  type: "MULTIPLE_CHOICE" | "FILL_IN" | "PREDICT_OUTPUT";
  options: string[];
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
};

const EMPTY_QUIZ_FORM: QuizFormState = {
  lessonId: "",
  question: "",
  type: "MULTIPLE_CHOICE",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
  orderIndex: 0,
};

export default function AdminDashboardClient({
  modules: initialModules,
  lessons: initialLessons,
  quizQuestions: initialQuizQuestions,
}: {
  modules: Module[];
  lessons: Lesson[];
  quizQuestions: QuizQuestion[];
}) {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(initialQuizQuestions);
  const [activeTab, setActiveTab] = useState<"modules" | "lessons" | "quizzes">("modules");
  const [editingLesson, setEditingLesson] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", summary: "", slug: "", contentMDX: "" });
  const [saving, setSaving] = useState(false);

  // Quiz state
  const [quizForm, setQuizForm] = useState<QuizFormState>(EMPTY_QUIZ_FORM);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizError, setQuizError] = useState("");

  async function togglePublish(entityType: "module" | "lesson", entityId: string, currentState: boolean) {
    const response = await fetch("/api/admin/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, entityId, published: !currentState }),
    });

    if (response.ok) {
      if (entityType === "module") {
        setModules((prev) =>
          prev.map((mod) => (mod.id === entityId ? { ...mod, published: !currentState } : mod)),
        );
      } else {
        setLessons((prev) =>
          prev.map((lesson) => (lesson.id === entityId ? { ...lesson, published: !currentState } : lesson)),
        );
      }
    }
  }

  async function saveLesson(lessonId: string) {
    setSaving(true);

    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    const response = await fetch("/api/admin/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonId,
        moduleId: lesson.moduleId,
        slug: editForm.slug || lesson.slug,
        title: editForm.title || lesson.title,
        summary: editForm.summary || lesson.summary,
        contentMDX: editForm.contentMDX || "# Content placeholder",
        difficulty: lesson.difficulty,
        estimatedMinutes: lesson.estimatedMinutes,
        tags: [],
        published: lesson.published,
      }),
    });

    if (response.ok) {
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lessonId
            ? {
                ...l,
                title: editForm.title || l.title,
                summary: editForm.summary || l.summary,
                slug: editForm.slug || l.slug,
              }
            : l,
        ),
      );
      setEditingLesson(null);
    }

    setSaving(false);
  }

  // --- Quiz question helpers ---

  function openNewQuizForm() {
    setQuizForm(EMPTY_QUIZ_FORM);
    setQuizError("");
    setShowQuizForm(true);
  }

  function openEditQuizForm(q: QuizQuestion) {
    let parsedOptions: string[] = [];
    if (q.options) {
      try {
        parsedOptions = JSON.parse(q.options);
      } catch {
        parsedOptions = [];
      }
    }

    setQuizForm({
      questionId: q.id,
      lessonId: q.lessonId,
      question: q.question,
      type: q.type as QuizFormState["type"],
      options: parsedOptions.length > 0 ? parsedOptions : ["", "", "", ""],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      orderIndex: q.orderIndex,
    });
    setQuizError("");
    setShowQuizForm(true);
  }

  function updateOption(index: number, value: string) {
    setQuizForm((prev) => {
      const next = [...prev.options];
      next[index] = value;
      return { ...prev, options: next };
    });
  }

  function addOption() {
    if (quizForm.options.length >= 6) return;
    setQuizForm((prev) => ({ ...prev, options: [...prev.options, ""] }));
  }

  function removeOption(index: number) {
    if (quizForm.options.length <= 2) return;
    setQuizForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  }

  async function saveQuizQuestion() {
    setSaving(true);
    setQuizError("");

    const filteredOptions = quizForm.options.filter((opt) => opt.trim().length > 0);

    const payload: Record<string, unknown> = {
      lessonId: quizForm.lessonId,
      question: quizForm.question,
      type: quizForm.type,
      correctAnswer: quizForm.correctAnswer,
      explanation: quizForm.explanation,
      orderIndex: quizForm.orderIndex,
    };

    if (quizForm.questionId) {
      payload.questionId = quizForm.questionId;
    }

    if (quizForm.type === "MULTIPLE_CHOICE" && filteredOptions.length >= 2) {
      payload.options = filteredOptions;
    }

    try {
      const response = await fetch("/api/admin/quiz-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        setQuizError(typeof data.message === "string" ? data.message : "Failed to save question.");
        setSaving(false);
        return;
      }

      const data = await response.json();
      const saved = data.question;

      // Re-fetch lesson info for display
      const lessonInfo = lessons.find((l) => l.id === saved.lessonId);
      const enriched: QuizQuestion = {
        ...saved,
        lesson: lessonInfo
          ? { title: lessonInfo.title, slug: lessonInfo.slug, id: lessonInfo.id }
          : { title: "Unknown", slug: "", id: saved.lessonId },
      };

      if (quizForm.questionId) {
        setQuizQuestions((prev) => prev.map((q) => (q.id === saved.id ? enriched : q)));
      } else {
        setQuizQuestions((prev) => [...prev, enriched]);
        // Bump the lesson quiz count
        setLessons((prev) =>
          prev.map((l) =>
            l.id === saved.lessonId
              ? { ...l, _count: { ...l._count, quizQuestions: l._count.quizQuestions + 1 } }
              : l,
          ),
        );
      }

      setShowQuizForm(false);
    } catch {
      setQuizError("Network error. Please try again.");
    }

    setSaving(false);
  }

  async function deleteQuizQuestion(questionId: string, lessonId: string) {
    if (!confirm("Delete this quiz question?")) return;

    const response = await fetch("/api/admin/quiz-questions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId }),
    });

    if (response.ok) {
      setQuizQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setLessons((prev) =>
        prev.map((l) =>
          l.id === lessonId
            ? { ...l, _count: { ...l._count, quizQuestions: Math.max(0, l._count.quizQuestions - 1) } }
            : l,
        ),
      );
    }
  }

  // --- Group quiz questions by lesson for display ---
  const quizzesByLesson = quizQuestions.reduce<Record<string, { lessonTitle: string; questions: QuizQuestion[] }>>(
    (acc, q) => {
      if (!acc[q.lessonId]) {
        acc[q.lessonId] = { lessonTitle: q.lesson.title, questions: [] };
      }
      acc[q.lessonId].questions.push(q);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "modules"}
          onClick={() => setActiveTab("modules")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "modules"
              ? "bg-academy-accent text-white"
              : "bg-academy-card text-academy-muted hover:text-academy-text"
          }`}
        >
          Modules ({modules.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "lessons"}
          onClick={() => setActiveTab("lessons")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "lessons"
              ? "bg-academy-accent text-white"
              : "bg-academy-card text-academy-muted hover:text-academy-text"
          }`}
        >
          Lessons ({lessons.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "quizzes"}
          onClick={() => setActiveTab("quizzes")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "quizzes"
              ? "bg-academy-accent text-white"
              : "bg-academy-card text-academy-muted hover:text-academy-text"
          }`}
        >
          Quiz Questions ({quizQuestions.length})
        </button>
      </div>

      {/* Modules Tab */}
      {activeTab === "modules" && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Curriculum Modules</h3>
          {modules.map((mod) => (
            <div key={mod.id} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-academy-muted font-mono text-sm w-8">#{mod.orderIndex}</span>
                <div>
                  <h4 className="font-medium text-academy-text">{mod.title}</h4>
                  <p className="text-sm text-academy-muted">
                    {mod._count.lessons} lessons &middot; /{mod.slug}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {mod.comingSoon && (
                  <span className="text-xs bg-academy-violet/20 text-academy-violet px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
                <button
                  onClick={() => togglePublish("module", mod.id, mod.published)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                    mod.published
                      ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                      : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  }`}
                  aria-label={`${mod.published ? "Unpublish" : "Publish"} ${mod.title}`}
                >
                  {mod.published ? "Published" : "Unpublished"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lessons Tab */}
      {activeTab === "lessons" && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">All Lessons</h3>
          {lessons.map((lesson) => (
            <div key={lesson.id} className="glass-card p-4">
              {editingLesson === lesson.id ? (
                /* Edit Mode */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={`title-${lesson.id}`} className="text-sm text-academy-muted block mb-1">
                        Title
                      </label>
                      <input
                        id={`title-${lesson.id}`}
                        value={editForm.title}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text"
                      />
                    </div>
                    <div>
                      <label htmlFor={`slug-${lesson.id}`} className="text-sm text-academy-muted block mb-1">
                        Slug
                      </label>
                      <input
                        id={`slug-${lesson.id}`}
                        value={editForm.slug}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor={`summary-${lesson.id}`} className="text-sm text-academy-muted block mb-1">
                      Summary
                    </label>
                    <textarea
                      id={`summary-${lesson.id}`}
                      value={editForm.summary}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, summary: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveLesson(lesson.id)}
                      disabled={saving}
                      className="bg-academy-accent text-white px-4 py-2 rounded-lg hover:bg-academy-accent/80 disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingLesson(null)}
                      className="bg-academy-card text-academy-muted px-4 py-2 rounded-lg hover:text-academy-text"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                /* View Mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-medium text-academy-text">{lesson.title}</h4>
                      <p className="text-sm text-academy-muted">
                        {lesson.module.title} &middot; {lesson.estimatedMinutes} min &middot;{" "}
                        {lesson._count.exercises} exercises &middot; {lesson._count.quizQuestions} quiz questions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingLesson(lesson.id);
                        setEditForm({
                          title: lesson.title,
                          summary: lesson.summary,
                          slug: lesson.slug,
                          contentMDX: "",
                        });
                      }}
                      className="text-xs bg-academy-accent/20 text-academy-accent px-3 py-1.5 rounded-lg hover:bg-academy-accent/30"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => togglePublish("lesson", lesson.id, lesson.published)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        lesson.published
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                      }`}
                      aria-label={`${lesson.published ? "Unpublish" : "Publish"} ${lesson.title}`}
                    >
                      {lesson.published ? "Published" : "Unpublished"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quiz Questions Tab */}
      {activeTab === "quizzes" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Quiz Questions</h3>
            <button
              onClick={openNewQuizForm}
              className="bg-academy-accent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-academy-accent/80"
            >
              + Add Question
            </button>
          </div>

          {/* Quiz create/edit form */}
          {showQuizForm && (
            <div className="glass-card p-5 space-y-4 border border-academy-accent/30">
              <h4 className="font-semibold text-academy-text">
                {quizForm.questionId ? "Edit Question" : "New Question"}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="quiz-lesson" className="text-sm text-academy-muted block mb-1">
                    Lesson
                  </label>
                  <select
                    id="quiz-lesson"
                    value={quizForm.lessonId}
                    onChange={(e) => setQuizForm((prev) => ({ ...prev, lessonId: e.target.value }))}
                    className="w-full px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text"
                  >
                    <option value="">Select a lesson...</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.module.title} &rsaquo; {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quiz-type" className="text-sm text-academy-muted block mb-1">
                    Type
                  </label>
                  <select
                    id="quiz-type"
                    value={quizForm.type}
                    onChange={(e) =>
                      setQuizForm((prev) => ({
                        ...prev,
                        type: e.target.value as QuizFormState["type"],
                      }))
                    }
                    className="w-full px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text"
                  >
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="FILL_IN">Fill In</option>
                    <option value="PREDICT_OUTPUT">Predict Output</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="quiz-question-text" className="text-sm text-academy-muted block mb-1">
                  Question
                </label>
                <textarea
                  id="quiz-question-text"
                  value={quizForm.question}
                  onChange={(e) => setQuizForm((prev) => ({ ...prev, question: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text"
                />
              </div>

              {quizForm.type === "MULTIPLE_CHOICE" && (
                <div>
                  <p className="text-sm text-academy-muted mb-2">Answer Options</p>
                  <div className="space-y-2">
                    {quizForm.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          value={opt}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text text-sm"
                          aria-label={`Option ${i + 1}`}
                        />
                        {quizForm.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            className="text-red-400 hover:text-red-300 text-sm px-2"
                            aria-label={`Remove option ${i + 1}`}
                          >
                            &times;
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {quizForm.options.length < 6 && (
                    <button
                      type="button"
                      onClick={addOption}
                      className="mt-2 text-xs text-academy-accent hover:text-academy-accent/80"
                    >
                      + Add option
                    </button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="quiz-answer" className="text-sm text-academy-muted block mb-1">
                    Correct Answer
                  </label>
                  <input
                    id="quiz-answer"
                    value={quizForm.correctAnswer}
                    onChange={(e) => setQuizForm((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                    className="w-full px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text"
                    placeholder="Must match one of the options exactly"
                  />
                </div>
                <div>
                  <label htmlFor="quiz-order" className="text-sm text-academy-muted block mb-1">
                    Order Index
                  </label>
                  <input
                    id="quiz-order"
                    type="number"
                    min={0}
                    max={50}
                    value={quizForm.orderIndex}
                    onChange={(e) => setQuizForm((prev) => ({ ...prev, orderIndex: parseInt(e.target.value, 10) || 0 }))}
                    className="w-full px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quiz-explanation" className="text-sm text-academy-muted block mb-1">
                  Explanation (shown after answering)
                </label>
                <textarea
                  id="quiz-explanation"
                  value={quizForm.explanation}
                  onChange={(e) => setQuizForm((prev) => ({ ...prev, explanation: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-academy-bg border border-academy-accent/30 rounded-lg text-academy-text"
                />
              </div>

              {quizError && (
                <p className="text-sm text-red-300" role="alert">
                  {quizError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  onClick={saveQuizQuestion}
                  disabled={saving}
                  className="bg-academy-accent text-white px-4 py-2 rounded-lg hover:bg-academy-accent/80 disabled:opacity-50 text-sm font-medium"
                >
                  {saving ? "Saving..." : quizForm.questionId ? "Update" : "Create"}
                </button>
                <button
                  onClick={() => setShowQuizForm(false)}
                  className="bg-academy-card text-academy-muted px-4 py-2 rounded-lg hover:text-academy-text text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Quiz questions grouped by lesson */}
          {Object.keys(quizzesByLesson).length === 0 && !showQuizForm && (
            <p className="text-academy-muted text-sm">No quiz questions yet. Click &ldquo;+ Add Question&rdquo; to create one.</p>
          )}

          {Object.entries(quizzesByLesson).map(([lessonId, group]) => (
            <div key={lessonId} className="space-y-2">
              <h4 className="text-sm font-semibold text-academy-mint">{group.lessonTitle}</h4>
              {group.questions.map((q) => {
                let optionsList: string[] = [];
                if (q.options) {
                  try {
                    optionsList = JSON.parse(q.options);
                  } catch {
                    optionsList = [];
                  }
                }

                return (
                  <div key={q.id} className="glass-card p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-academy-text">{q.question}</p>
                        <p className="text-xs text-academy-muted mt-1">
                          Type: {q.type.replace(/_/g, " ")} &middot; Order: {q.orderIndex} &middot; Answer:{" "}
                          <span className="text-emerald-400">{q.correctAnswer}</span>
                        </p>
                        {optionsList.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {optionsList.map((opt, i) => (
                              <span
                                key={i}
                                className={`inline-block rounded px-2 py-0.5 text-xs ${
                                  opt === q.correctAnswer
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-academy-card text-academy-muted border border-academy-muted/20"
                                }`}
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => openEditQuizForm(q)}
                          className="text-xs bg-academy-accent/20 text-academy-accent px-3 py-1.5 rounded-lg hover:bg-academy-accent/30"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteQuizQuestion(q.id, q.lessonId)}
                          className="text-xs bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
