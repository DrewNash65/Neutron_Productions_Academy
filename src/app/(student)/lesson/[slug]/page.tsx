import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";
import { getLessonBySlugForUser, getModuleBySlugForUser } from "@/server/services/curriculum-service";
import { prisma } from "@/lib/db";
import { QUIZ_PASSING_SCORE_PERCENT } from "@/server/services/quiz-service";
import SandboxEditor from "@/components/lesson/SandboxEditor";
import QuizBlock from "@/components/lesson/QuizBlock";
import MarkCompleteButton from "./MarkCompleteButton";
import LessonSidebar from "./LessonSidebar";

export default async function LessonPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const lesson = await getLessonBySlugForUser(params.slug, session.user.id);

  if (!lesson) {
    notFound();
  }

  const module = await getModuleBySlugForUser(lesson.module.slug, session.user.id);
  const moduleLessons = module?.lessons ?? [];

  const currentIndex = moduleLessons.findIndex((item) => item.slug === lesson.slug);
  const prevLesson = currentIndex > 0 ? moduleLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < moduleLessons.length - 1 ? moduleLessons[currentIndex + 1] : null;

  const progressStatus = lesson.progress[0]?.status ?? "NOT_STARTED";
  const isCompleted = progressStatus === "COMPLETED";

  const glossaryEntries =
    lesson.glossary && typeof lesson.glossary === "string"
      ? (JSON.parse(lesson.glossary) as Record<string, string>)
      : lesson.glossary && typeof lesson.glossary === "object" && !Array.isArray(lesson.glossary)
        ? (lesson.glossary as Record<string, string>)
        : {};

  const exercisesForClient = lesson.exercises.map((exercise) => ({
    id: exercise.id,
    prompt: exercise.prompt,
    starterHtml: exercise.starterHtml,
    starterCss: exercise.starterCss,
    starterJs: exercise.starterJs,
    hint: exercise.hint,
    validationType: exercise.validationType as "DOM_CHECK" | "JS_CHECK",
    validationConfig: (typeof exercise.validationConfig === "string" ? JSON.parse(exercise.validationConfig) : exercise.validationConfig) as Record<string, unknown>,
  }));

  const quizQuestionsForClient = lesson.quizQuestions.map((question) => ({
    id: question.id,
    question: question.question,
    type: question.type as "MULTIPLE_CHOICE" | "FILL_IN" | "PREDICT_OUTPUT",
    options: (typeof question.options === "string" ? JSON.parse(question.options) : question.options) as string[] | undefined,
    explanation: question.explanation,
    orderIndex: question.orderIndex,
  }));

  const hasQuiz = quizQuestionsForClient.length > 0;
  const passedQuizAttempt = hasQuiz
    ? await prisma.quizAttempt.findFirst({
        where: {
          userId: session.user.id,
          lessonId: lesson.id,
          passed: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : null;
  const hasPassedRequiredQuiz = !hasQuiz || Boolean(passedQuizAttempt);

  const sidebarLessons = moduleLessons.map((item) => ({
    slug: item.slug,
    title: item.title,
    status: item.status,
    isCurrent: item.slug === lesson.slug,
  }));

  return (
    <main className="min-h-screen bg-academy-bg text-academy-text">
      <div className="mx-auto flex w-full max-w-screen-2xl">
        <LessonSidebar
          moduleTitle={lesson.module.title}
          moduleSlug={lesson.module.slug}
          lessons={sidebarLessons}
          glossary={glossaryEntries}
        />

        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-8">
            <nav className="flex flex-wrap items-center gap-2 text-sm text-academy-muted">
              <Link href="/curriculum" className="transition hover:text-academy-mint">
                Curriculum
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                href={`/module/${lesson.module.slug}`}
                className="transition hover:text-academy-mint"
              >
                {lesson.module.title}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-academy-text">{lesson.title}</span>
            </nav>

            <header className="glass-card p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs uppercase tracking-[0.2em] text-academy-mint">Lesson</span>
                {isCompleted ? (
                  <span className="inline-flex rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-0.5 text-xs font-medium text-emerald-200">
                    Completed ✅
                  </span>
                ) : null}
              </div>
              <h1 className="mt-2 text-3xl font-bold gradient-text md:text-4xl">{lesson.title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-academy-muted">{lesson.summary}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-academy-muted">
                <span>~{lesson.estimatedMinutes} min</span>
                <span className="flex items-center gap-1" aria-label={`Difficulty ${lesson.difficulty} of 5`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={`inline-block h-2 w-2 rounded-full ${index < lesson.difficulty ? "bg-academy-accent" : "bg-academy-muted/30"}`}
                      aria-hidden="true"
                    />
                  ))}
                </span>
              </div>
            </header>

            <article className="glass-card p-6 md:p-8" aria-label="Lesson content">
              <div
                className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:text-academy-text prose-p:text-academy-text/90 prose-p:leading-relaxed prose-a:text-academy-accent hover:prose-a:text-academy-mint prose-code:rounded prose-code:bg-academy-card prose-code:px-1.5 prose-code:py-0.5 prose-code:text-academy-mint prose-pre:border prose-pre:border-academy-muted/20 prose-pre:bg-academy-card prose-blockquote:border-academy-accent/40 prose-blockquote:text-academy-muted prose-strong:text-academy-text prose-li:text-academy-text/90"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.contentMDX) }}
              />
            </article>

            {exercisesForClient.length > 0 ? (
              <section aria-labelledby="exercises-title" className="space-y-4">
                <h2 id="exercises-title" className="text-2xl font-bold gradient-text">
                  Practice Exercises
                </h2>
                <SandboxEditor exercises={exercisesForClient} />
              </section>
            ) : null}

            {quizQuestionsForClient.length > 0 ? (
              <section aria-labelledby="quiz-title" className="space-y-4">
                <h2 id="quiz-title" className="sr-only">
                  Lesson Quiz
                </h2>
                <QuizBlock
                  lessonId={lesson.id}
                  questions={quizQuestionsForClient}
                  passingScorePercent={QUIZ_PASSING_SCORE_PERCENT}
                />
              </section>
            ) : null}

            <div className="glass-card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <MarkCompleteButton
                lessonId={lesson.id}
                initialCompleted={isCompleted}
                requiresQuizPass={hasQuiz}
                hasPassedRequiredQuiz={hasPassedRequiredQuiz}
              />

              <nav className="flex items-center gap-3" aria-label="Lesson navigation">
                {prevLesson && !prevLesson.locked ? (
                  <Link
                    href={`/lesson/${prevLesson.slug}`}
                    className="inline-flex items-center rounded-lg border border-academy-muted/35 bg-academy-bg px-4 py-2 text-sm font-medium text-academy-text transition hover:border-academy-mint/60"
                  >
                    ← {prevLesson.title}
                  </Link>
                ) : null}

                {nextLesson && !nextLesson.locked ? (
                  <Link
                    href={`/lesson/${nextLesson.slug}`}
                    className="hover-lift inline-flex items-center rounded-lg bg-academy-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-academy-violet"
                  >
                    {nextLesson.title} →
                  </Link>
                ) : null}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
