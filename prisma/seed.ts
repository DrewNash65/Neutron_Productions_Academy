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

// ────────────────────────────────────────────────────────────────
// 5 quiz questions per lesson = 40 total
// ────────────────────────────────────────────────────────────────

const quizQuestionSeeds: SeedQuizQuestion[] = [
  // ── welcome-to-the-academy ──────────────────────────────────
  {
    lessonSlug: "welcome-to-the-academy",
    question: "What three components does every lesson in this academy include?",
    options: [
      "Reading material, interactive exercises, and quizzes",
      "Videos, podcasts, and flashcards",
      "Textbooks, homework, and final exams",
      "Lectures, labs, and office hours",
    ],
    correctAnswer: "Reading material, interactive exercises, and quizzes",
    explanation: "The lesson states each lesson includes reading material, interactive exercises, and quizzes to test understanding.",
    orderIndex: 0,
  },
  {
    lessonSlug: "welcome-to-the-academy",
    question: "What does the academy track for you as you learn?",
    options: ["Your progress", "Your typing speed", "Your screen time", "Your social media activity"],
    correctAnswer: "Your progress",
    explanation: "The lesson says every step is tracked so you can see your progress.",
    orderIndex: 1,
  },
  {
    lessonSlug: "welcome-to-the-academy",
    question: "Where does the learning path begin?",
    options: [
      "With the fundamentals",
      "With advanced algorithms",
      "With database design",
      "With mobile app development",
    ],
    correctAnswer: "With the fundamentals",
    explanation: "The lesson explains that you start with fundamentals and build up to real projects.",
    orderIndex: 2,
  },
  {
    lessonSlug: "welcome-to-the-academy",
    question: "What is the ultimate goal of the learning path?",
    options: [
      "Building real projects",
      "Memorizing syntax",
      "Passing certification exams",
      "Reading documentation",
    ],
    correctAnswer: "Building real projects",
    explanation: "The lesson says the path starts with fundamentals and builds up to real projects.",
    orderIndex: 3,
  },
  {
    lessonSlug: "welcome-to-the-academy",
    question: "What makes the exercises in this academy 'interactive'?",
    options: [
      "You practice hands-on instead of just reading",
      "They play music while you code",
      "They require a partner to complete",
      "They use virtual reality headsets",
    ],
    correctAnswer: "You practice hands-on instead of just reading",
    explanation: "Interactive exercises let you practice directly, combining doing with learning rather than passive reading alone.",
    orderIndex: 4,
  },

  // ── setting-up-your-environment ─────────────────────────────
  {
    lessonSlug: "setting-up-your-environment",
    question: "Which of the following is recommended as a text editor?",
    options: ["VS Code", "Microsoft Word", "Notepad", "Google Docs"],
    correctAnswer: "VS Code",
    explanation: "The lesson specifically recommends VS Code as a text editor for coding.",
    orderIndex: 0,
  },
  {
    lessonSlug: "setting-up-your-environment",
    question: "Which keyboard shortcut opens browser developer tools?",
    options: ["F12 or Ctrl+Shift+I", "Ctrl+C", "Alt+F4", "Ctrl+Z"],
    correctAnswer: "F12 or Ctrl+Shift+I",
    explanation: "The lesson says to press F12 or Ctrl+Shift+I to open developer tools.",
    orderIndex: 1,
  },
  {
    lessonSlug: "setting-up-your-environment",
    question: "Which tab in developer tools lets you run JavaScript directly?",
    options: ["Console", "Elements", "Network", "Sources"],
    correctAnswer: "Console",
    explanation: "The lesson says the Console tab lets you run JavaScript directly in the browser.",
    orderIndex: 2,
  },
  {
    lessonSlug: "setting-up-your-environment",
    question: "Which browsers does the lesson list as 'modern browsers'?",
    options: [
      "Chrome, Firefox, or Edge",
      "Internet Explorer, Safari, or Opera",
      "Netscape, Mosaic, or Lynx",
      "Brave, Vivaldi, or Tor",
    ],
    correctAnswer: "Chrome, Firefox, or Edge",
    explanation: "The lesson lists Chrome, Firefox, and Edge as modern browser options.",
    orderIndex: 3,
  },
  {
    lessonSlug: "setting-up-your-environment",
    question: "What command does the lesson ask you to type in the Console as a first test?",
    options: [
      "console.log('Hello, world!')",
      "alert('Hello, world!')",
      "print('Hello, world!')",
      "document.write('Hello, world!')",
    ],
    correctAnswer: "console.log('Hello, world!')",
    explanation: "The lesson asks you to type console.log('Hello, world!') and press Enter.",
    orderIndex: 4,
  },

  // ── what-is-computational-thinking ──────────────────────────
  {
    lessonSlug: "what-is-computational-thinking",
    question: "What does 'decomposition' mean in computational thinking?",
    options: [
      "Breaking a problem into smaller, manageable parts",
      "Removing bugs from code",
      "Deleting old files",
      "Compressing data into smaller files",
    ],
    correctAnswer: "Breaking a problem into smaller, manageable parts",
    explanation: "Decomposition means breaking a complex problem into smaller, manageable pieces.",
    orderIndex: 0,
  },
  {
    lessonSlug: "what-is-computational-thinking",
    question: "What is 'pattern recognition'?",
    options: [
      "Finding similarities or trends in data or problems",
      "Memorizing keyboard shortcuts",
      "Recognizing faces in photos",
      "Identifying file types by their extension",
    ],
    correctAnswer: "Finding similarities or trends in data or problems",
    explanation: "Pattern recognition is about finding similarities or trends that can help solve problems more efficiently.",
    orderIndex: 1,
  },
  {
    lessonSlug: "what-is-computational-thinking",
    question: "What does 'abstraction' involve?",
    options: [
      "Focusing on important information and ignoring irrelevant details",
      "Making code more complex",
      "Adding more variables to a program",
      "Writing longer function names",
    ],
    correctAnswer: "Focusing on important information and ignoring irrelevant details",
    explanation: "Abstraction means focusing on what matters and filtering out unnecessary details.",
    orderIndex: 2,
  },
  {
    lessonSlug: "what-is-computational-thinking",
    question: "How many pillars of computational thinking are described in the lesson?",
    options: ["Four", "Two", "Six", "Eight"],
    correctAnswer: "Four",
    explanation: "The lesson describes four pillars: decomposition, pattern recognition, abstraction, and algorithms.",
    orderIndex: 3,
  },
  {
    lessonSlug: "what-is-computational-thinking",
    question: "Are computational thinking skills only useful for coding?",
    options: [
      "No, they help with everyday problem solving too",
      "Yes, only for writing software",
      "Yes, only for computer science classes",
      "No, but only for math and science",
    ],
    correctAnswer: "No, they help with everyday problem solving too",
    explanation: "The lesson explicitly states these skills help with everyday problem solving, not just coding.",
    orderIndex: 4,
  },

  // ── algorithms-in-everyday-life ─────────────────────────────
  {
    lessonSlug: "algorithms-in-everyday-life",
    question: "How does the lesson define an algorithm?",
    options: [
      "A set of step-by-step instructions",
      "A type of programming language",
      "A complex mathematical formula",
      "A computer hardware component",
    ],
    correctAnswer: "A set of step-by-step instructions",
    explanation: "The lesson defines an algorithm as a set of step-by-step instructions.",
    orderIndex: 0,
  },
  {
    lessonSlug: "algorithms-in-everyday-life",
    question: "Which everyday activity is used as an algorithm example in the lesson?",
    options: [
      "Making a sandwich",
      "Solving a Rubik's cube",
      "Playing chess",
      "Assembling furniture",
    ],
    correctAnswer: "Making a sandwich",
    explanation: "The lesson uses making a peanut butter and jelly sandwich as a step-by-step algorithm example.",
    orderIndex: 1,
  },
  {
    lessonSlug: "algorithms-in-everyday-life",
    question: "What is the first step in the 'Getting to School' algorithm?",
    options: ["Leave home", "Turn right on Main Street", "Enter the school", "Walk three blocks"],
    correctAnswer: "Leave home",
    explanation: "The algorithm starts with 'Leave home' as step 1.",
    orderIndex: 2,
  },
  {
    lessonSlug: "algorithms-in-everyday-life",
    question: "Why does the order of steps matter in an algorithm?",
    options: [
      "Because computers follow instructions exactly in order",
      "Because alphabetical order is required",
      "Because random order produces the same result",
      "Because only the last step matters",
    ],
    correctAnswer: "Because computers follow instructions exactly in order",
    explanation: "The lesson explains that programming is writing algorithms for computers, and clarity and order matter.",
    orderIndex: 3,
  },
  {
    lessonSlug: "algorithms-in-everyday-life",
    question: "What happens when your algorithm instructions are unclear?",
    options: [
      "Your code will not work correctly",
      "The computer will guess what you mean",
      "Nothing, computers fix errors automatically",
      "The program runs faster",
    ],
    correctAnswer: "Your code will not work correctly",
    explanation: "The lesson says the clearer your instructions, the better your code, implying unclear instructions lead to errors.",
    orderIndex: 4,
  },

  // ── boolean-logic-basics ────────────────────────────────────
  {
    lessonSlug: "boolean-logic-basics",
    question: "What are the only two values in boolean logic?",
    options: ["true and false", "0 and 1", "yes and no", "on and off"],
    correctAnswer: "true and false",
    explanation: "The lesson says boolean logic means everything is either true or false.",
    orderIndex: 0,
  },
  {
    lessonSlug: "boolean-logic-basics",
    question: "What does the AND operator require for the result to be true?",
    options: [
      "Both conditions must be true",
      "At least one condition must be true",
      "Neither condition needs to be true",
      "Only the first condition needs to be true",
    ],
    correctAnswer: "Both conditions must be true",
    explanation: "AND requires both conditions to be true for the overall result to be true.",
    orderIndex: 1,
  },
  {
    lessonSlug: "boolean-logic-basics",
    question: "What is the result of 'true OR false'?",
    options: ["true", "false", "undefined", "error"],
    correctAnswer: "true",
    explanation: "OR returns true when at least one condition is true. Since one side is true, the result is true.",
    orderIndex: 2,
  },
  {
    lessonSlug: "boolean-logic-basics",
    question: "What does the NOT operator do?",
    options: [
      "Flips the boolean value",
      "Combines two values",
      "Compares two numbers",
      "Adds two values together",
    ],
    correctAnswer: "Flips the boolean value",
    explanation: "NOT inverts the value: NOT true becomes false, and NOT false becomes true.",
    orderIndex: 3,
  },
  {
    lessonSlug: "boolean-logic-basics",
    question: "In the real-world example, when will the person go outside?",
    options: [
      "When it's sunny AND they've finished homework",
      "When it's sunny OR they've finished homework",
      "When it's NOT sunny",
      "Whenever they want",
    ],
    correctAnswer: "When it's sunny AND they've finished homework",
    explanation: "The example uses AND logic: both conditions (sunny + homework done) must be true.",
    orderIndex: 4,
  },

  // ── how-the-web-works ───────────────────────────────────────
  {
    lessonSlug: "how-the-web-works",
    question: "What is the first step in the request-response cycle?",
    options: [
      "You type a URL in your browser",
      "The server sends back HTML",
      "The browser renders CSS",
      "JavaScript executes",
    ],
    correctAnswer: "You type a URL in your browser",
    explanation: "The cycle begins when you type a URL into the browser's address bar.",
    orderIndex: 0,
  },
  {
    lessonSlug: "how-the-web-works",
    question: "What does HTTP stand for in web communication?",
    options: [
      "The protocol browsers and servers use to communicate",
      "A type of programming language",
      "A database format",
      "A CSS framework",
    ],
    correctAnswer: "The protocol browsers and servers use to communicate",
    explanation: "The lesson defines HTTP as the protocol browsers and servers use to communicate.",
    orderIndex: 1,
  },
  {
    lessonSlug: "how-the-web-works",
    question: "Which technology is responsible for the structure of a web page?",
    options: ["HTML", "CSS", "JavaScript", "HTTP"],
    correctAnswer: "HTML",
    explanation: "The lesson defines HTML as providing the structure of a web page.",
    orderIndex: 2,
  },
  {
    lessonSlug: "how-the-web-works",
    question: "Which technology handles the styling (appearance) of a web page?",
    options: ["CSS", "HTML", "JavaScript", "URL"],
    correctAnswer: "CSS",
    explanation: "The lesson says CSS is responsible for the styling of a web page.",
    orderIndex: 3,
  },
  {
    lessonSlug: "how-the-web-works",
    question: "What does the server send back to the browser after receiving a request?",
    options: [
      "A response containing HTML, CSS, and JS",
      "A new URL",
      "A software update",
      "An email notification",
    ],
    correctAnswer: "A response containing HTML, CSS, and JS",
    explanation: "The lesson says the server sends back a response with HTML, CSS, and JavaScript.",
    orderIndex: 4,
  },

  // ── your-first-html-page ────────────────────────────────────
  {
    lessonSlug: "your-first-html-page",
    question: "What does HTML stand for?",
    options: [
      "HyperText Markup Language",
      "High Tech Modern Language",
      "Home Tool Management Link",
      "Hyper Transfer Method Logic",
    ],
    correctAnswer: "HyperText Markup Language",
    explanation: "The lesson introduces HTML as HyperText Markup Language.",
    orderIndex: 0,
  },
  {
    lessonSlug: "your-first-html-page",
    question: "Which element creates the main heading in the HTML example?",
    options: ["<h1>", "<p>", "<title>", "<head>"],
    correctAnswer: "<h1>",
    explanation: "The example shows <h1>Hello, World!</h1> as the main visible heading.",
    orderIndex: 1,
  },
  {
    lessonSlug: "your-first-html-page",
    question: "What does the <p> element represent?",
    options: ["A paragraph", "A picture", "A page break", "A program"],
    correctAnswer: "A paragraph",
    explanation: "The lesson lists <p> as the paragraph element.",
    orderIndex: 2,
  },
  {
    lessonSlug: "your-first-html-page",
    question: "Which element is used to create a hyperlink?",
    options: ["<a>", "<h1>", "<img>", "<ul>"],
    correctAnswer: "<a>",
    explanation: "The lesson lists <a href='...'> as the link element.",
    orderIndex: 3,
  },
  {
    lessonSlug: "your-first-html-page",
    question: "Where does visible page content go in the HTML structure?",
    options: [
      "Inside the <body> element",
      "Inside the <head> element",
      "Inside the <title> element",
      "Outside the <html> element",
    ],
    correctAnswer: "Inside the <body> element",
    explanation: "The example shows the heading and paragraph inside <body>, which holds all visible content.",
    orderIndex: 4,
  },

  // ── styling-with-css ────────────────────────────────────────
  {
    lessonSlug: "styling-with-css",
    question: "What does CSS stand for?",
    options: [
      "Cascading Style Sheets",
      "Computer Style System",
      "Creative Site Styling",
      "Code Syntax Sheets",
    ],
    correctAnswer: "Cascading Style Sheets",
    explanation: "The lesson introduces CSS as Cascading Style Sheets.",
    orderIndex: 0,
  },
  {
    lessonSlug: "styling-with-css",
    question: "What is the role of a CSS selector?",
    options: [
      "To target which HTML elements a rule applies to",
      "To create new HTML elements",
      "To delete elements from the page",
      "To run JavaScript functions",
    ],
    correctAnswer: "To target which HTML elements a rule applies to",
    explanation: "Selectors specify which HTML elements a CSS rule applies to, such as h1, .class, or #id.",
    orderIndex: 1,
  },
  {
    lessonSlug: "styling-with-css",
    question: "Which of these is NOT part of the CSS box model?",
    options: ["Selector", "Padding", "Border", "Margin"],
    correctAnswer: "Selector",
    explanation: "The box model consists of content, padding, border, and margin. Selectors are a separate concept.",
    orderIndex: 2,
  },
  {
    lessonSlug: "styling-with-css",
    question: "In the box model, what is 'padding'?",
    options: [
      "Space inside the border, around the content",
      "Space outside the border",
      "The visible edge of the element",
      "The actual text or image",
    ],
    correctAnswer: "Space inside the border, around the content",
    explanation: "Padding is the space between the content and the border, inside the element.",
    orderIndex: 3,
  },
  {
    lessonSlug: "styling-with-css",
    question: "Which CSS property changes the text color of an element?",
    options: ["color", "font-size", "margin", "border"],
    correctAnswer: "color",
    explanation: "The lesson shows 'color: blue;' to change the text color of an h1 element.",
    orderIndex: 4,
  },
];

// ────────────────────────────────────────────────────────────────
// Expanded lesson content (rich markdown for each lesson)
// ────────────────────────────────────────────────────────────────

const lessonContents: Record<string, string> = {
  "welcome-to-the-academy": `# Welcome to Neutron Productions Coding Academy

This is where your coding journey begins. Whether you have never written a line of code or are brushing up on the basics, this academy is designed to guide you step by step.

## What Is This Academy?

Neutron Productions Coding Academy is an **interactive learning platform** that teaches you to code from the ground up. Instead of passively watching videos, you will read, practice, and prove your knowledge at every step.

## How Lessons Work

Every lesson in this academy follows the same structure so you always know what to expect:

1. **Reading Material** — You are reading it right now! Each lesson begins with a clear explanation of the topic, including real-world examples and code snippets.
2. **Interactive Exercises** — After the reading, you will find hands-on coding challenges that let you practice what you just learned directly in the browser.
3. **Quizzes** — At the end of each lesson, a short quiz checks your understanding. You must score at least **80%** to mark the lesson as complete.

## Your Learning Path

The curriculum is organised into **modules**, and each module contains several lessons that build on one another:

- **Getting Started** — You are here! Learn how the platform works.
- **Computer Thinking & Logic** — Build a foundation in problem-solving before you write code.
- **Web Basics (HTML & CSS)** — Create and style your first web pages.
- **JavaScript Fundamentals** *(coming soon)* — Make your pages interactive.

## Progress Tracking

Every step you take is tracked automatically:

- A **progress bar** on your dashboard shows how far you have come.
- Completed lessons are marked with a green checkmark.
- Your **streak** counts the number of consecutive days you have studied.

## Tips for Success

- **Go at your own pace.** There is no deadline.
- **Do not skip exercises.** Hands-on practice is where real learning happens.
- **Re-read if needed.** You can revisit any lesson at any time.
- **Take the quizzes seriously.** They reinforce what you have learned.

Let's get started — click **Next Lesson** below to set up your coding environment!`,

  "setting-up-your-environment": `# Setting Up Your Environment

Before you write your first line of code, you need the right tools. The good news? Everything you need is **free** and probably already on your computer.

## The Three Tools You Need

### 1. A Modern Web Browser

A web browser is where you will see your code come to life. We recommend one of these:

- **Google Chrome** — the most popular choice for developers
- **Mozilla Firefox** — an excellent alternative with great developer tools
- **Microsoft Edge** — built into Windows and based on the same engine as Chrome

> **Why does the browser matter?** Modern browsers come with built-in **developer tools** that let you inspect, debug, and experiment with code right inside the browser.

### 2. A Text Editor

A text editor is where you will write your code. While you *could* use Notepad, a proper code editor gives you:

- **Syntax highlighting** — code is colour-coded so it is easier to read
- **Auto-complete** — the editor suggests what you might type next
- **Error detection** — red underlines warn you about mistakes before you run the code

We recommend **Visual Studio Code** (VS Code). It is free, runs on Windows, Mac, and Linux, and is the most popular editor among developers worldwide.

### 3. Curiosity

Seriously! The best developers are endlessly curious. When something does not work, they ask *"Why?"* instead of giving up.

## The Browser Developer Console

The **Console** is your playground for experimenting with code. Here is how to open it:

1. Open your browser (Chrome, Firefox, or Edge).
2. Press \`F12\` on your keyboard — or press \`Ctrl+Shift+I\` (Windows/Linux) or \`Cmd+Option+I\` (Mac).
3. A panel will appear. Click the **Console** tab.

### Your First Experiment

Type the following into the Console and press **Enter**:

\`\`\`js
console.log('Hello, world!')
\`\`\`

You should see \`Hello, world!\` printed below. Congratulations — you just ran your first piece of code!

### Try a Few More

\`\`\`js
2 + 2
\`\`\`

\`\`\`js
"Neutron" + " Academy"
\`\`\`

\`\`\`js
Math.random()
\`\`\`

Each of these expressions is evaluated instantly. The Console is a fantastic place to test ideas before writing full programs.

## What is Next?

Now that your tools are ready, we will move on to **how to think like a programmer**. The next module focuses on computational thinking — the problem-solving mindset that underpins all of coding.`,

  "what-is-computational-thinking": `# What is Computational Thinking?

Before you write a single line of code, it helps to develop a **problem-solving mindset**. Computational thinking is a set of strategies that help you break down complex problems into pieces a computer (or a human!) can handle.

## The Four Pillars

Computational thinking rests on four key pillars. Think of them as mental tools you can reach for whenever you face a tricky problem.

### 1. Decomposition

**Decomposition** means breaking a big problem into smaller, more manageable parts.

**Example:** Imagine you need to plan a birthday party. That is a big task! But you can decompose it:
- Choose a date and venue
- Create a guest list
- Plan the food and drinks
- Organise games or activities
- Send invitations

Each sub-task is much easier to tackle on its own.

### 2. Pattern Recognition

**Pattern recognition** is about spotting similarities, trends, or repeated structures.

**Example:** If you have planned several parties before, you will notice patterns — you always need a guest list, you always need food, and so on. Recognising this pattern means you can re-use your approach instead of starting from scratch.

In coding, patterns appear everywhere. Once you learn how a \`for\` loop works, you can use it in hundreds of different situations.

### 3. Abstraction

**Abstraction** means focusing on the important details and ignoring what does not matter right now.

**Example:** When you use a map app for directions, you do not need to know how GPS satellites orbit the Earth. You only care about the route from A to B. The complexity is *abstracted away*.

In programming, we build abstractions all the time. A function like \`sendEmail()\` hides dozens of complicated steps behind a simple name.

### 4. Algorithms

An **algorithm** is a set of step-by-step instructions to solve a problem.

**Example:** A recipe is an algorithm: preheat the oven, mix the dry ingredients, add the wet ingredients, pour into a pan, bake for 30 minutes.

We will dive much deeper into algorithms in the next lesson.

## Putting It All Together

Here is how you might use all four pillars to solve a real problem — sorting a messy bookshelf:

1. **Decompose** — Separate books into categories (fiction, non-fiction, textbooks).
2. **Pattern Recognition** — Notice that books within each category can be sorted by author name.
3. **Abstraction** — Ignore the book covers and page counts; focus only on titles and authors.
4. **Algorithm** — For each category, arrange books alphabetically by author.

## Why This Matters for Coding

Every program you write is a solution to a problem. Computational thinking gives you a structured way to approach that problem *before* you start typing code. Developers who think before they code write better, cleaner software.

These skills are not limited to programming — they help with school assignments, work projects, and everyday decisions too!`,

  "algorithms-in-everyday-life": `# Algorithms in Everyday Life

You have already heard the word "algorithm" in the previous lesson. Now let's explore what algorithms really are, where they hide in your daily life, and why they matter so much in programming.

## What Is an Algorithm?

An algorithm is simply **a set of step-by-step instructions** designed to perform a task or solve a problem. The key properties of a good algorithm are:

- **Ordered** — the steps happen in a specific sequence.
- **Unambiguous** — each step is clear and leaves no room for confusion.
- **Finite** — the algorithm eventually ends (it does not run forever).

## Everyday Algorithm Examples

### Making a Peanut Butter & Jelly Sandwich

1. Get two slices of bread.
2. Spread peanut butter on one slice.
3. Spread jelly on the other slice.
4. Press the two slices together, fillings facing inward.
5. Cut diagonally (optional but highly recommended).

If you skip step 4, you end up with two open-faced sandwiches — which is not the goal!

### Getting to School

1. Leave home.
2. Turn right on Main Street.
3. Walk three blocks.
4. Turn left at the library.
5. Enter the school.

Change the order and you end up somewhere completely different. **Order matters.**

### Making a Cup of Tea

1. Boil water in a kettle.
2. Place a tea bag in a mug.
3. Pour the boiling water over the tea bag.
4. Wait 3–5 minutes.
5. Remove the tea bag.
6. Add milk or sugar if desired.

### Sorting Your Laundry

1. Gather all dirty clothes.
2. Separate into whites, colours, and delicates.
3. Load one pile into the washing machine.
4. Add detergent.
5. Select the appropriate wash cycle.
6. Press start.
7. Repeat for the remaining piles.

## Why Clarity Matters

Consider this vague instruction: *"Make the food."* A human might figure it out. A computer? No chance.

Computers are extremely fast but also extremely literal. They do **exactly** what you tell them — nothing more, nothing less. This is why programming is essentially **writing precise algorithms for computers**.

Compare these two instructions:

- **Vague:** "Sort the list."
- **Precise:** "Compare the first two numbers. If the first is bigger, swap them. Move to the next pair. Repeat until no swaps are needed."

The second version is an algorithm a computer can follow.

## From Algorithms to Code

Here is the tea algorithm expressed as **pseudocode** — a halfway point between English and a programming language:

\`\`\`
FUNCTION makeTea(milkWanted, sugarWanted):
    boilWater()
    placeBagInMug()
    pourWater()
    wait(minutes: 4)
    removeBag()
    IF milkWanted THEN addMilk()
    IF sugarWanted THEN addSugar()
    RETURN mug
\`\`\`

Notice how the steps map almost directly from the English list to the pseudocode. That is the power of thinking algorithmically *before* you start coding.

## Key Takeaways

- An algorithm is a **finite, ordered, unambiguous** set of instructions.
- You already use algorithms every day without realising it.
- Programming is the art of writing algorithms that computers can execute.
- The **clearer your instructions**, the **better your code**.`,

  "boolean-logic-basics": `# Boolean Logic Basics

Computers make decisions millions of times per second. At the heart of every decision is **boolean logic** — a system where everything is either \`true\` or \`false\`. Understanding boolean logic is essential because it powers every \`if\` statement, every search filter, and every login check you will ever write.

## What Is a Boolean?

A **boolean** is a data type with only two possible values:
- \`true\`
- \`false\`

Named after mathematician George Boole, booleans are the foundation of digital computing. Every bit in your computer's memory is either 0 (false) or 1 (true).

## The Three Basic Operators

### AND (\`&&\`)

The AND operator returns \`true\` **only when both conditions are true**.

| A     | B     | A AND B |
|-------|-------|---------|
| true  | true  | **true**|
| true  | false | false   |
| false | true  | false   |
| false | false | false   |

**Real-world example:** "I will go to the beach IF it is sunny **AND** I have finished my homework." Both conditions must be met.

### OR (\`||\`)

The OR operator returns \`true\` **when at least one condition is true**.

| A     | B     | A OR B  |
|-------|-------|---------|
| true  | true  | **true**|
| true  | false | **true**|
| false | true  | **true**|
| false | false | false   |

**Real-world example:** "I will have dessert IF there is cake **OR** there is ice cream." Either option works.

### NOT (\`!\`)

The NOT operator **flips** (inverts) a boolean value.

| A     | NOT A  |
|-------|--------|
| true  | false  |
| false | true   |

**Real-world example:** "I will bring an umbrella IF it is **NOT** sunny."

## Combining Operators

You can chain operators together to express complex conditions:

\`\`\`
(age >= 16) AND (hasLearnerPermit) AND (NOT hasSuspension)
\`\`\`

This could determine whether someone is eligible to drive. All three conditions must be satisfied.

## Real-World Boolean Logic

Boolean logic is everywhere:

- **Search engines:** \`"chocolate cake" AND "gluten free"\` finds recipes that match both.
- **Shopping filters:** \`price < 50 AND rating >= 4\` narrows results.
- **Login systems:** \`emailExists AND passwordMatches\` determines if you can sign in.
- **Thermostat:** \`temperature < 68 AND heatingEnabled\` decides whether to turn on the furnace.

## A Worked Example

*"I will go outside IF it is sunny AND I have finished homework."*

Let's test different scenarios:

| Sunny? | Homework done? | Go outside? |
|--------|---------------|-------------|
| true   | true          | **true** — both conditions met |
| true   | false         | false — homework not done |
| false  | true          | false — it is raining |
| false  | false         | false — neither condition met |

This is boolean logic in action — simple rules that produce clear, predictable outcomes.

## Key Takeaways

- Booleans have only two values: \`true\` and \`false\`.
- **AND** requires *all* conditions to be true.
- **OR** requires *at least one* condition to be true.
- **NOT** flips a value from true to false (or vice versa).
- Boolean logic is the basis of every decision a computer makes.`,

  "how-the-web-works": `# How the Web Works

Every time you visit a website — whether it is a search engine, a social network, or this academy — a fascinating chain of events happens in milliseconds. Understanding this process will help you make sense of everything else you learn about web development.

## The Big Picture

The web is built on a simple idea: **clients** (your browser) request information from **servers** (remote computers), and the servers send it back.

## The Request-Response Cycle

Here is what happens when you type a URL like \`https://example.com\` into your browser:

### Step 1: You Enter a URL
You type the web address into the browser's address bar and press Enter. URL stands for **Uniform Resource Locator** — it is the address of a specific page or resource on the web.

### Step 2: DNS Lookup
Your browser needs to find the server's **IP address** (a number like \`93.184.216.34\`). It asks the **Domain Name System (DNS)** — think of it as the internet's phone book — to translate \`example.com\` into the correct IP address.

### Step 3: The Browser Sends a Request
Your browser creates an **HTTP request** and sends it over the internet to the server at that IP address. The request says: *"Please send me the page at this address."*

### Step 4: The Server Processes the Request
The server receives the request, finds the right files, and prepares a response. This might involve reading from a database, running server-side code, or simply locating a static file.

### Step 5: The Server Sends a Response
The server sends back an **HTTP response** containing:
- **HTML** — the structure and content of the page
- **CSS** — the styling and layout rules
- **JavaScript** — code that adds interactivity
- **Images, fonts, and other assets**

### Step 6: The Browser Renders the Page
Your browser takes all these files and **renders** (draws) the final page you see on screen. It reads the HTML to build the page structure, applies the CSS to make it look right, and runs the JavaScript to make it interactive.

## Key Technologies

| Technology | Role | Example |
|-----------|------|---------|
| **URL** | Address of a web page | \`https://example.com/about\` |
| **HTTP/HTTPS** | Protocol for sending requests and responses | The rules of the conversation |
| **HTML** | Structure and content | Headings, paragraphs, images |
| **CSS** | Styling and layout | Colours, fonts, spacing |
| **JavaScript** | Behaviour and interactivity | Click handlers, animations |
| **DNS** | Translates domain names to IP addresses | The internet's phone book |

## Static vs Dynamic Websites

- **Static sites** serve the same HTML files to everyone. A personal portfolio with fixed content is static.
- **Dynamic sites** generate HTML on the fly using server-side code. A social media feed that shows different posts for each user is dynamic.

This academy is a **dynamic** web application — it generates personalised pages based on your progress and account.

## Why This Matters

Understanding the request-response cycle helps you:
- **Debug problems** — If a page does not load, you can figure out where things went wrong (DNS? Server? Browser?).
- **Write better code** — You will know which code runs on the server and which runs in the browser.
- **Build faster websites** — You will understand what affects page load times.

In the next lessons, you will start creating the **HTML** and **CSS** that servers send to browsers!`,

  "your-first-html-page": `# Your First HTML Page

HTML — **HyperText Markup Language** — is the skeleton of every web page. It defines the **structure and content**: headings, paragraphs, images, links, lists, and more. In this lesson, you will learn how HTML works and write your very first web page.

## What Is Markup?

HTML is a **markup** language, not a programming language. That means you use it to *mark up* (label) content so the browser knows what each piece is:

- "This is a heading"
- "This is a paragraph"
- "This is a link to another page"

The browser reads these labels and displays the content accordingly.

## The Basic HTML Structure

Every HTML page follows this blueprint:

\`\`\`html
<!DOCTYPE html>
<html>
  <head>
    <title>My First Page</title>
  </head>
  <body>
    <h1>Hello, World!</h1>
    <p>This is my first web page.</p>
  </body>
</html>
\`\`\`

Let's break it down:

| Element | Purpose |
|--------|---------|
| \`<!DOCTYPE html>\` | Tells the browser this is an HTML5 document |
| \`<html>\` | The root element that wraps everything |
| \`<head>\` | Contains metadata (title, character set, links to CSS) |
| \`<title>\` | The text shown in the browser tab |
| \`<body>\` | Contains all the **visible** content of the page |
| \`<h1>\` | The main heading (biggest and most important) |
| \`<p>\` | A paragraph of text |

## Common HTML Elements

### Headings (\`<h1>\` through \`<h6>\`)

HTML provides six levels of headings, from the most important (\`<h1>\`) to the least (\`<h6>\`):

\`\`\`html
<h1>Main Title</h1>
<h2>Section Title</h2>
<h3>Subsection Title</h3>
\`\`\`

Use them in order — do not skip from \`<h1>\` straight to \`<h4>\`.

### Paragraphs (\`<p>\`)

\`\`\`html
<p>This is a paragraph. It can contain as much text as you like.</p>
<p>This is another paragraph. The browser adds spacing between them.</p>
\`\`\`

### Links (\`<a>\`)

The anchor element creates clickable hyperlinks:

\`\`\`html
<a href="https://example.com">Visit Example</a>
\`\`\`

The \`href\` attribute tells the browser where the link goes.

### Images (\`<img>\`)

\`\`\`html
<img src="photo.jpg" alt="A description of the image">
\`\`\`

The \`alt\` attribute provides a text description for screen readers and for cases when the image cannot load.

### Lists

**Unordered list** (bullet points):
\`\`\`html
<ul>
  <li>Apples</li>
  <li>Bananas</li>
  <li>Cherries</li>
</ul>
\`\`\`

**Ordered list** (numbered):
\`\`\`html
<ol>
  <li>Preheat oven</li>
  <li>Mix ingredients</li>
  <li>Bake for 30 minutes</li>
</ol>
\`\`\`

## Tags, Elements, and Attributes

- A **tag** is the label itself: \`<p>\`, \`</p>\`, \`<img>\`.
- An **element** is the opening tag + content + closing tag: \`<p>Hello</p>\`.
- An **attribute** provides extra information: \`href="..."\`, \`src="..."\`, \`alt="..."\`.

## Nesting

HTML elements can be **nested** inside one another:

\`\`\`html
<p>This is <strong>bold</strong> and this is <em>italic</em>.</p>
\`\`\`

Proper nesting matters — always close inner elements before outer ones.

## Key Takeaways

- HTML defines the **structure** of web pages.
- Every page needs \`<!DOCTYPE html>\`, \`<html>\`, \`<head>\`, and \`<body>\`.
- Visible content goes inside \`<body>\`.
- Elements like \`<h1>\`, \`<p>\`, \`<a>\`, \`<img>\`, and \`<ul>\` are the building blocks.
- Attributes like \`href\` and \`src\` give elements extra information.

Try creating your own page in the exercise below!`,

  "styling-with-css": `# Styling with CSS

You have learned how to structure a page with HTML. Now it is time to make it look great. **CSS — Cascading Style Sheets** — is the language that controls colours, fonts, spacing, layout, and everything visual on a web page.

## Why CSS?

Without CSS, every website would look like a plain document from the 1990s — black text on a white background with blue underlined links. CSS lets you transform that into something beautiful and professional.

## How to Add CSS

There are three ways to add CSS to an HTML page:

### 1. Inline Styles (quick but messy)
\`\`\`html
<h1 style="color: blue;">Hello</h1>
\`\`\`

### 2. Internal Stylesheet (good for single pages)
\`\`\`html
<head>
  <style>
    h1 { color: blue; }
  </style>
</head>
\`\`\`

### 3. External Stylesheet (best practice)
\`\`\`html
<head>
  <link rel="stylesheet" href="styles.css">
</head>
\`\`\`

External stylesheets keep your HTML clean and let you re-use the same styles across many pages.

## Anatomy of a CSS Rule

Every CSS rule has the same structure:

\`\`\`css
selector {
  property: value;
}
\`\`\`

**Example:**
\`\`\`css
h1 {
  color: blue;
  font-size: 24px;
}

p {
  color: gray;
  line-height: 1.6;
}
\`\`\`

| Part | What It Does | Example |
|------|-------------|---------|
| **Selector** | Targets which element(s) to style | \`h1\`, \`.card\`, \`#header\` |
| **Property** | The visual aspect to change | \`color\`, \`font-size\`, \`margin\` |
| **Value** | The new setting | \`blue\`, \`24px\`, \`10px\` |

## Types of Selectors

| Selector | Targets | Example |
|----------|---------|---------|
| Element | All elements of that type | \`p { ... }\` |
| Class | Elements with a specific class | \`.highlight { ... }\` |
| ID | The one element with that ID | \`#header { ... }\` |
| Descendant | Elements nested inside another | \`article p { ... }\` |

Classes (prefixed with \`.\`) are the most commonly used selectors in real-world projects.

## The Box Model

Every HTML element is rendered as a rectangular **box**. The box model describes the layers of that box:

\`\`\`
┌──────────── Margin ────────────┐
│  ┌──────── Border ──────────┐  │
│  │  ┌──── Padding ────────┐ │  │
│  │  │                     │ │  │
│  │  │     Content         │ │  │
│  │  │                     │ │  │
│  │  └─────────────────────┘ │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
\`\`\`

- **Content** — the actual text, image, or other media.
- **Padding** — transparent space **inside** the border, around the content.
- **Border** — the visible edge of the element.
- **Margin** — transparent space **outside** the border, separating the element from neighbours.

\`\`\`css
.card {
  padding: 20px;
  border: 1px solid #ccc;
  margin: 16px 0;
}
\`\`\`

## Common CSS Properties

| Property | What It Does | Example Value |
|----------|-------------|---------------|
| \`color\` | Text colour | \`#333\`, \`blue\`, \`rgb(0,0,0)\` |
| \`background-color\` | Background colour | \`#f5f5f5\` |
| \`font-size\` | Size of text | \`16px\`, \`1.2rem\` |
| \`font-weight\` | Boldness of text | \`bold\`, \`600\` |
| \`margin\` | Space outside element | \`10px\`, \`0 auto\` |
| \`padding\` | Space inside element | \`20px\`, \`8px 16px\` |
| \`border\` | Element border | \`1px solid black\` |
| \`border-radius\` | Rounded corners | \`8px\`, \`50%\` |
| \`width\` / \`height\` | Dimensions | \`100%\`, \`200px\` |

## The Cascade

The "C" in CSS stands for **Cascading**. When multiple rules target the same element, the browser uses a priority system:

1. **Inline styles** (highest priority)
2. **ID selectors** (\`#header\`)
3. **Class selectors** (\`.card\`)
4. **Element selectors** (\`p\`)
5. **Inherited styles** (lowest priority)

If two rules have the same specificity, the one written **later** in the file wins.

## Key Takeaways

- CSS controls the **visual appearance** of HTML elements.
- A CSS rule has three parts: **selector**, **property**, and **value**.
- The **box model** (content, padding, border, margin) governs spacing.
- **Classes** are the most practical selector for real projects.
- The **cascade** determines which styles win when there are conflicts.
- Use **external stylesheets** for clean, maintainable code.`,
};

// ────────────────────────────────────────────────────────────────

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
      contentMDX: lessonContents["welcome-to-the-academy"],
      orderIndex: 0,
      difficulty: 1,
      estimatedMinutes: 8,
      published: true,
    },
    {
      moduleId: gettingStarted.id,
      slug: "setting-up-your-environment",
      title: "Setting Up Your Environment",
      summary: "Get your tools ready: browser, text editor, and developer console.",
      contentMDX: lessonContents["setting-up-your-environment"],
      orderIndex: 1,
      difficulty: 1,
      estimatedMinutes: 12,
      published: true,
    },
    // Computer Thinking
    {
      moduleId: computerThinking.id,
      slug: "what-is-computational-thinking",
      title: "What is Computational Thinking?",
      summary: "Learn the four pillars: decomposition, pattern recognition, abstraction, and algorithms.",
      contentMDX: lessonContents["what-is-computational-thinking"],
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
      contentMDX: lessonContents["algorithms-in-everyday-life"],
      orderIndex: 1,
      difficulty: 1,
      estimatedMinutes: 15,
      published: true,
    },
    {
      moduleId: computerThinking.id,
      slug: "boolean-logic-basics",
      title: "Boolean Logic Basics",
      summary: "True or false: learn AND, OR, NOT and how computers make decisions.",
      contentMDX: lessonContents["boolean-logic-basics"],
      orderIndex: 2,
      difficulty: 2,
      estimatedMinutes: 18,
      published: true,
    },
    // Web Basics
    {
      moduleId: webBasics.id,
      slug: "how-the-web-works",
      title: "How the Web Works",
      summary: "Understand browsers, servers, HTTP, and URLs at a high level.",
      contentMDX: lessonContents["how-the-web-works"],
      orderIndex: 0,
      difficulty: 1,
      estimatedMinutes: 15,
      published: true,
    },
    {
      moduleId: webBasics.id,
      slug: "your-first-html-page",
      title: "Your First HTML Page",
      summary: "Write your first HTML document with headings, paragraphs, and links.",
      contentMDX: lessonContents["your-first-html-page"],
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
      contentMDX: lessonContents["styling-with-css"],
      orderIndex: 2,
      difficulty: 2,
      estimatedMinutes: 25,
      published: true,
    },
  ];

  for (const lesson of lessonData) {
    await prisma.lesson.upsert({
      where: { slug: lesson.slug },
      update: { contentMDX: lesson.contentMDX, estimatedMinutes: lesson.estimatedMinutes },
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

    // Seed a passing quiz attempt so the completion is consistent with the quiz gate
    const welcomeQuizQuestions = await prisma.quizQuestion.findMany({
      where: { lessonId: welcomeLesson.id },
    });
    if (welcomeQuizQuestions.length > 0) {
      const answers: Record<string, string> = {};
      for (const q of welcomeQuizQuestions) {
        answers[q.id] = q.correctAnswer;
      }
      // Delete any old seed attempts
      await prisma.quizAttempt.deleteMany({
        where: { userId: student.id, lessonId: welcomeLesson.id },
      });
      await prisma.quizAttempt.create({
        data: {
          userId: student.id,
          lessonId: welcomeLesson.id,
          score: welcomeQuizQuestions.length,
          maxScore: welcomeQuizQuestions.length,
          passed: true,
          answers: JSON.stringify(answers),
        },
      });
    }

    console.log("  Progress: Welcome lesson completed for student (with quiz attempt)");
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
