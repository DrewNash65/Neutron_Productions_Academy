import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { redirect } from "next/navigation";
import { getAnalyticsOverview } from "@/server/services/analytics-service";

import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export default async function AdminPage() {
  const session = await getAuthSession();

  if (!isAdmin(session)) {
    redirect("/dashboard");
  }

  const [modules, lessons, quizQuestions, analytics] = await Promise.all([
    prisma.module.findMany({
      include: { _count: { select: { lessons: true } } },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.lesson.findMany({
      include: {
        module: { select: { title: true, slug: true } },
        _count: { select: { exercises: true, quizQuestions: true } },
      },
      orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    }),
    prisma.quizQuestion.findMany({
      include: {
        lesson: { select: { title: true, slug: true, id: true } },
      },
      orderBy: [{ lesson: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    }),
    getAnalyticsOverview(),
  ]);

  return (
    <div className="min-h-screen bg-academy-bg">
      {/* Header */}
      <header className="border-b border-academy-accent/20 bg-academy-card/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-sm text-academy-muted">Manage curriculum, lessons, and view analytics</p>
          </div>
          <a
            href="/dashboard"
            className="text-academy-accent hover:text-academy-accent/80 text-sm font-medium"
          >
            &larr; Back to Student View
          </a>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Analytics Overview */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Analytics (Last 7 Days)</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <AnalyticsCard
              label="Active Users"
              value={analytics.activeUsers7d}
              icon="👥"
            />
            <AnalyticsCard
              label="Lesson Completions"
              value={analytics.lessonCompletions7d}
              icon="✅"
            />
            <AnalyticsCard
              label="Avg Quiz Score"
              value={`${analytics.averageQuizScore7d}%`}
              icon="📊"
            />
            <AnalyticsCard
              label="In Progress (Drop-off Risk)"
              value={analytics.dropOffCount7d}
              icon="⚠️"
            />
          </div>
        </section>

        {/* Content Management */}
        <AdminDashboardClient
          modules={JSON.parse(JSON.stringify(modules))}
          lessons={JSON.parse(JSON.stringify(lessons))}
          quizQuestions={JSON.parse(JSON.stringify(quizQuestions))}
        />
      </div>
    </div>
  );
}

function AnalyticsCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="glass-card p-5 hover-lift">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-sm text-academy-muted">{label}</p>
          <p className="text-2xl font-bold text-academy-text">{value}</p>
        </div>
      </div>
    </div>
  );
}
