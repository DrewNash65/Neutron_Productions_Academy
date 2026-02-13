import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

type SeedQuizQuestion = {
  lessonSlug: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
};

const quizQuestionSeeds: SeedQuizQuestion[] = [
  {
    lessonSlug: "welcome-to-the-academy",
    question: "What is tracked at each step in the academy?",
    options: ["Progress", "Browser history", "Typing speed", "Operating system updates"],
    correctAnswer: "Progress",
    explanation: "The lesson explains that every step is tracked so learners can see their progress.",
    orderIndex: 0,
  },
  {
    lessonSlug: "setting-up-your-environment",
    question: "Which key can open browser developer tools in the lesson instructions?",
    options: ["F12", "F2", "F5", "F9"],
    correctAnswer: "F12",
    explanation: "The lesson says to press F12 (or Ctrl+Shift+I) to open developer tools.",
    orderIndex: 0,
  },
  {
    lessonSlug: "what-is-computational-thinking",
    question: "Which of these is one of the four pillars of computational thinking?",
    options: ["Abstraction", "Compression", "Compilation", "Virtualization"],
    correctAnswer: "Abstraction",
    explanation: "The four pillars listed are decomposition, pattern recognition, abstraction, and algorithms.",
    orderIndex: 0,
  },
  {
    lessonSlug: "algorithms-in-everyday-life",
    question: "How does the lesson define an algorithm?",
    options: [
      "A set of step-by-step instructions",
      "A visual page layout",
      "A database table",
      "A browser plugin",
    ],
    correctAnswer: "A set of step-by-step instructions",
    explanation: "The lesson frames algorithms as clear, ordered instructions.",
    orderIndex: 0,
  },
  {
    lessonSlug: "boolean-logic-basics",
    question: "When does `true AND false` evaluate to true?",
    options: ["Never", "Only on weekends", "When NOT is applied", "When OR is used"],
    correctAnswer: "Never",
    explanation: "AND is only true when both conditions are true.",
    orderIndex: 0,
  },
  {
    lessonSlug: "how-the-web-works",
    question: "In the request-response cycle, what happens after you type a URL?",
    options: [
      "The browser sends a request to a server",
      "The server builds hardware",
      "The browser installs dependencies",
      "The CSS compiles into SQL",
    ],
    correctAnswer: "The browser sends a request to a server",
    explanation: "The lesson describes a browser request followed by a server response.",
    orderIndex: 0,
  },
  {
    lessonSlug: "your-first-html-page",
    question: "Which element is used for the main heading in the HTML example?",
    options: ["<h1>", "<p>", "<a>", "<div>"],
    correctAnswer: "<h1>",
    explanation: "The example places “Hello, World!” inside an h1 tag.",
    orderIndex: 0,
  },
  {
    lessonSlug: "styling-with-css",
    question: "What is the role of a CSS selector?",
    options: [
      "Target HTML elements",
      "Compile JavaScript",
      "Create API routes",
      "Validate SQL queries",
    ],
    correctAnswer: "Target HTML elements",
    explanation: "Selectors specify which HTML elements a CSS rule applies to.",
    orderIndex: 0,
  },
];

async function seedQuizQuestions() {
  const lessonSlugs = [...new Set(quizQuestionSeeds.map((seed) => seed.lessonSlug))];
  const lessons = await prisma.lesson.findMany({
    where: { slug: { in: lessonSlugs } },
    select: { id: true, slug: true },
  });

  const lessonIdBySlug = new Map(lessons.map((lesson) => [lesson.slug, lesson.id]));
  const lessonIds = lessons.map((lesson) => lesson.id);

  if (lessonIds.length > 0) {
    await prisma.quizQuestion.deleteMany({
      where: { lessonId: { in: lessonIds } },
    });
  }

  const questionData = quizQuestionSeeds.flatMap((seed) => {
    const lessonId = lessonIdBySlug.get(seed.lessonSlug);
    if (!lessonId) {
      console.warn(`  Skipping quiz question seed: lesson not found (${seed.lessonSlug})`);
      return [];
    }

    return [
      {
        lessonId,
        question: seed.question,
        type: "MULTIPLE_CHOICE",
        options: JSON.stringify(seed.options),
        correctAnswer: seed.correctAnswer,
        explanation: seed.explanation,
        orderIndex: seed.orderIndex,
      },
    ];
  });

  if (questionData.length > 0) {
    await prisma.quizQuestion.createMany({ data: questionData });
  }

  console.log(`  Quiz questions seeded: ${questionData.length}`);
}

async function main() {
  console.log("Seeding database...");

  // --- Admin user ---
  const adminPassword = await hash("Admin12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@neutron.dev" },
    update: {},
    create: {
      email: "admin@neutron.dev",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`  Admin user: ${admin.email}`);

  // --- Student user ---
  const studentPassword = await hash("Student12345", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@neutron.dev" },
    update: {},
    create: {
      email: "student@neutron.dev",
      name: "Demo Student",
      passwordHash: studentPassword,
      role: "STUDENT",
    },
  });
  console.log(`  Student user: ${student.email}`);

  // --- Modules ---
  const modules = [
    {
      slug: "getting-started",
      title: "Getting Started",
      description: "Meet the platform, set your goals, and learn how lessons work.",
      orderIndex: 0,
      published: true,
      comingSoon: false,
    },
    {
      slug: "computer-thinking",
      title: "Computer Thinking & Logic",
      description: "Build a foundation in computational thinking, problem decomposition, and logical reasoning.",
      orderIndex: 1,
      published: true,
      comingSoon: false,
    },
    {
      slug: "web-basics",
      title: "Web Basics (HTML & CSS)",
      description: "Learn how the web works and build your first pages with HTML and CSS.",
      orderIndex: 2,
      published: true,
      comingSoon: false,
    },
    {
      slug: "javascript-fundamentals",
      title: "JavaScript Fundamentals",
      description: "Variables, functions, loops, and DOM manipulation to make pages interactive.",
      orderIndex: 3,
      published: false,
      comingSoon: true,
    },
  ];

  for (const mod of modules) {
    await prisma.module.upsert({
      where: { slug: mod.slug },
      update: {},
      create: {
        slug: mod.slug,
        title: mod.title,
        description: mod.description,
        orderIndex: mod.orderIndex,
        published: mod.published,
        comingSoon: mod.comingSoon,
        track: "WEB",
      },
    });
    console.log(`  Module: ${mod.title}`);
  }

  // --- Lessons for each published module ---
  const gettingStarted = await prisma.module.findUnique({ where: { slug: "getting-started" } });
  const computerThinking = await prisma.module.findUnique({ where: { slug: "computer-thinking" } });
  const webBasics = await prisma.module.findUnique({ where: { slug: "web-basics" } });

  if (!gettingStarted || !computerThinking || !webBasics) {
    throw new Error("Modules not found after upsert");
  }

  const lessonData = [
    // Getting Started
    {
      moduleId: gettingStarted.id,
      slug: "welcome-to-the-academy",
      title: "Welcome to the Academy",
      summary: "An overview of the platform, how lessons work, and what you will learn.",
      contentMDX: "# Welcome to Neutron Productions Coding Academy\n\nThis is where your coding journey begins. In this lesson, you'll learn how the platform works and what to expect.\n\n## How Lessons Work\n\nEach lesson includes:\n- Reading material (like this!)\n- Interactive exercises\n- Quizzes to test your understanding\n\n## Your Learning Path\n\nWe'll start with the fundamentals and build up to real projects. Every step is tracked so you can see your progress.\n\nLet's get started!",
      orderIndex: 0,
      difficulty: 1,
      estimatedMinutes: 5,
      published: true,
    },
    {
      moduleId: gettingStarted.id,
      slug: "setting-up-your-environment",
      title: "Setting Up Your Environment",
      summary: "Get your tools ready: browser, text editor, and developer console.",
      contentMDX: "# Setting Up Your Environment\n\nBefore we start coding, let's make sure you have the right tools.\n\n## What You Need\n\n1. **A modern browser** (Chrome, Firefox, or Edge)\n2. **A text editor** (VS Code is recommended)\n3. **Curiosity** (the most important tool!)\n\n## The Browser Developer Console\n\nPress `F12` or `Ctrl+Shift+I` to open developer tools. The Console tab lets you run JavaScript directly.\n\nTry typing: `console.log('Hello, world!')` and press Enter.",
      orderIndex: 1,
      difficulty: 1,
      estimatedMinutes: 10,
      published: true,
    },
    // Computer Thinking
    {
      moduleId: computerThinking.id,
      slug: "what-is-computational-thinking",
      title: "What is Computational Thinking?",
      summary: "Learn the four pillars: decomposition, pattern recognition, abstraction, and algorithms.",
      contentMDX: "# What is Computational Thinking?\n\nComputational thinking is a problem-solving approach that helps you break complex problems into manageable pieces.\n\n## The Four Pillars\n\n### 1. Decomposition\nBreaking a problem into smaller, manageable parts.\n\n### 2. Pattern Recognition\nFinding similarities or trends in data or problems.\n\n### 3. Abstraction\nFocusing on important information and ignoring irrelevant details.\n\n### 4. Algorithms\nCreating step-by-step instructions to solve a problem.\n\nThese skills aren't just for coding — they help with everyday problem solving too!",
      orderIndex: 0,
      difficulty: 1,
      estimatedMinutes: 15,
      published: true,
    },
    {
      moduleId: computerThinking.id,
      slug: "algorithms-in-everyday-life",
      title: "Algorithms in Everyday Life",
      summary: "Discover how algorithms surround us: recipes, directions, and decision trees.",
      contentMDX: "# Algorithms in Everyday Life\n\nAn algorithm is just a set of step-by-step instructions. You use them every day!\n\n## Examples\n\n### Making a Sandwich\n1. Get two slices of bread\n2. Spread peanut butter on one slice\n3. Spread jelly on the other\n4. Press them together\n\n### Getting to School\n1. Leave home\n2. Turn right on Main Street\n3. Walk three blocks\n4. Turn left at the library\n5. Enter the school\n\n## Why This Matters\n\nProgramming is essentially writing algorithms for computers. The clearer your instructions, the better your code!",
      orderIndex: 1,
      difficulty: 1,
      estimatedMinutes: 12,
      published: true,
    },
    {
      moduleId: computerThinking.id,
      slug: "boolean-logic-basics",
      title: "Boolean Logic Basics",
      summary: "True or false: learn AND, OR, NOT and how computers make decisions.",
      contentMDX: "# Boolean Logic Basics\n\nComputers make decisions using **boolean logic** — everything is either `true` or `false`.\n\n## The Three Basic Operators\n\n### AND (&&)\nBoth conditions must be true.\n- `true AND true` = `true`\n- `true AND false` = `false`\n\n### OR (||)\nAt least one condition must be true.\n- `true OR false` = `true`\n- `false OR false` = `false`\n\n### NOT (!)\nFlips the value.\n- `NOT true` = `false`\n- `NOT false` = `true`\n\n## Real-World Example\n\n\"I'll go outside IF it's sunny AND I've finished homework.\"\n\nThis is boolean logic in action!",
      orderIndex: 2,
      difficulty: 2,
      estimatedMinutes: 15,
      published: true,
    },
    // Web Basics
    {
      moduleId: webBasics.id,
      slug: "how-the-web-works",
      title: "How the Web Works",
      summary: "Understand browsers, servers, HTTP, and URLs at a high level.",
      contentMDX: "# How the Web Works\n\nEvery time you visit a website, a fascinating process unfolds behind the scenes.\n\n## The Request-Response Cycle\n\n1. You type a URL in your browser\n2. Your browser sends a **request** to a server\n3. The server processes the request\n4. The server sends back a **response** (HTML, CSS, JS)\n5. Your browser renders the page\n\n## Key Terms\n\n- **URL**: The address of a web page\n- **HTTP**: The protocol browsers and servers use to communicate\n- **HTML**: The structure of a web page\n- **CSS**: The styling of a web page\n- **JavaScript**: The behavior of a web page",
      orderIndex: 0,
      difficulty: 1,
      estimatedMinutes: 10,
      published: true,
    },
    {
      moduleId: webBasics.id,
      slug: "your-first-html-page",
      title: "Your First HTML Page",
      summary: "Write your first HTML document with headings, paragraphs, and links.",
      contentMDX: "# Your First HTML Page\n\nHTML (HyperText Markup Language) is the skeleton of every web page.\n\n## Basic Structure\n\n```html\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>My First Page</title>\n  </head>\n  <body>\n    <h1>Hello, World!</h1>\n    <p>This is my first web page.</p>\n  </body>\n</html>\n```\n\n## Common Elements\n\n- `<h1>` to `<h6>` — Headings\n- `<p>` — Paragraphs\n- `<a href=\"...\">` — Links\n- `<img src=\"...\">` — Images\n- `<ul>` / `<ol>` — Lists\n\nTry creating your own page in the exercise below!",
      orderIndex: 1,
      difficulty: 1,
      estimatedMinutes: 20,
      published: true,
    },
    {
      moduleId: webBasics.id,
      slug: "styling-with-css",
      title: "Styling with CSS",
      summary: "Add colors, fonts, and layout to your HTML with CSS selectors and properties.",
      contentMDX: "# Styling with CSS\n\nCSS (Cascading Style Sheets) makes your HTML look beautiful.\n\n## Adding CSS\n\n```html\n<style>\n  h1 {\n    color: blue;\n    font-size: 24px;\n  }\n  p {\n    color: gray;\n    line-height: 1.6;\n  }\n</style>\n```\n\n## Key Concepts\n\n- **Selectors**: Target HTML elements (`h1`, `.class`, `#id`)\n- **Properties**: What to change (`color`, `font-size`, `margin`)\n- **Values**: The new setting (`blue`, `24px`, `10px`)\n\n## The Box Model\n\nEvery element is a box with:\n- **Content** — the actual text/image\n- **Padding** — space inside the border\n- **Border** — the edge of the box\n- **Margin** — space outside the border",
      orderIndex: 2,
      difficulty: 2,
      estimatedMinutes: 25,
      published: true,
    },
  ];

  for (const lesson of lessonData) {
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: {},
      create: {
        moduleId: lesson.moduleId,
        slug: lesson.slug,
        title: lesson.title,
        summary: lesson.summary,
        contentMDX: lesson.contentMDX,
        orderIndex: lesson.orderIndex,
        difficulty: lesson.difficulty,
        estimatedMinutes: lesson.estimatedMinutes,
        published: lesson.published,
        tags: "[]",
      },
    });
    console.log(`    Lesson: ${lesson.title}`);
  }

  // --- Seed quiz questions for interactive learning ---
  await seedQuizQuestions();

  // --- Give student some progress ---
  const welcomeLesson = await prisma.lesson.findUnique({ where: { slug: "welcome-to-the-academy" } });
  const setupLesson = await prisma.lesson.findUnique({ where: { slug: "setting-up-your-environment" } });

  if (welcomeLesson) {
    await prisma.progress.upsert({
      where: {
        userId_lessonId: { userId: student.id, lessonId: welcomeLesson.id },
      },
      update: {},
      create: {
        userId: student.id,
        lessonId: welcomeLesson.id,
        status: "COMPLETED",
        percent: 100,
        completedAt: new Date(),
      },
    });
    console.log("  Progress: Welcome lesson completed for student");
  }

  if (setupLesson) {
    await prisma.progress.upsert({
      where: {
        userId_lessonId: { userId: student.id, lessonId: setupLesson.id },
      },
      update: {},
      create: {
        userId: student.id,
        lessonId: setupLesson.id,
        status: "IN_PROGRESS",
        percent: 40,
      },
    });
    console.log("  Progress: Setup lesson in progress for student");
  }

  console.log("\nSeed complete!");
  console.log("  Admin login:   admin@neutron.dev / Admin12345");
  console.log("  Student login:  student@neutron.dev / Student12345");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
