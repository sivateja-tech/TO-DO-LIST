# 📋 TaskFlow — Professional Task & Productivity Manager

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-Semantic-orange.svg)](https://developer.mozilla.org/en-US/docs/Glossary/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-Variables%20%26%20Flexbox%2FGrid-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Responsive](https://img.shields.io/badge/Mobile-Responsive-success.svg)](#responsive-design)
[![Offline Ready](https://img.shields.io/badge/Storage-localStorage-brightgreen.svg)](#localstorage-persistence)

> A modern, responsive, framework-free **Task Management Web Application** designed for productivity and ease of use. Built from the ground up with pure vanilla HTML5, CSS3 custom properties, and modern JavaScript (ES6+).

---

## 🌟 Key Features

### 1. 📝 Full Task CRUD Operations
- **Add Tasks**: Quickly add tasks with title, priority level, category, due date, and expandable detailed notes.
- **Edit Tasks**: Update task details in place with an elegant, keyboard-accessible modal dialog without losing data.
- **Toggle Completion**: Interactive animated checkboxes with instant visual feedback (strike-through and status updates).
- **Safe Deletion**: Custom confirmation dialog prevents accidental deletion; includes bulk **"Clear Done"** action.

### 2. 📊 Dynamic Analytics & Progress Tracking
- **Real-Time Stat Counters**:
  - **Total Tasks**: Total count of all tasks.
  - **Completed**: Tasks finished.
  - **Pending**: Active tasks awaiting completion.
  - **Overdue**: Automatically flags tasks past their due date with high-visibility warning badges.
- **Animated Progress Bar**: Visual percentage completion bar with smooth transitions and dynamic, motivational status messages.

### 3. 🎯 Priority Levels & Due Dates
- **Priority Badges**: Color-coded badges for **High** (🔴 Red), **Medium** (🟡 Amber), and **Low** (🟢 Emerald).
- **Intelligent Due Dates**: Automatically identifies and badges tasks as:
  - `⚠️ Overdue (Date)`
  - `⏰ Due Today`
  - `📅 Due Tomorrow`
  - `📅 Upcoming (Date)`
  - `✓ Completed`

### 4. 🔍 Instant Search, Filters & Sorting
- **Live Search**: Instant keyword search matching task titles, categories, and internal notes as you type.
- **Status Tabs**: Easily switch between **All**, **Active**, and **Completed** tasks with dynamic count badges.
- **Multi-Filter**: Filter simultaneously by **Priority** (High, Medium, Low) and **Category** (Work, Personal, Study, Finance, Health, General).
- **Flexible Sorting**:
  - Due Date: Soonest first / Furthest first
  - Priority: High → Low / Low → High
  - Date Created: Newest first / Oldest first
  - Alphabetical: A → Z

### 5. 🌓 Dark & Light Mode Theme Engine
- Seamless theme toggle button with animated Sun & Moon icons.
- Powered by modern **CSS Custom Properties** (variables).
- Automatically detects the user's system preference (`prefers-color-scheme`) and persists choice in `localStorage`.

### 6. 💾 100% Client-Side LocalStorage Persistence
- All tasks, changes, and theme preferences automatically save to browser `localStorage`.
- Works completely offline with zero latency and no external server dependencies.
- Comes preloaded with sensible sample demonstration tasks for immediate review.

### 7. 📱 Mobile-First Responsive UI & Animations
- Clean, modern SaaS aesthetic with subtle shadows and rounded curves.
- Fully responsive layout optimized for mobile phones (<480px), tablets (<768px), and desktop viewports.
- Non-intrusive floating **toast notifications** provide instant user feedback for every action.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| <kbd>Enter</kbd> | Submit and add a new task (from title input) |
| <kbd>/</kbd> | Focus the real-time search input from anywhere |
| <kbd>Esc</kbd> | Dismiss any open modal dialog (Edit or Delete) |
| <kbd>Tab</kbd> | Accessible keyboard navigation through all controls |

---

## 🗂️ Project Structure

```text
TO-DO-LIST/
├── index.html       # Primary semantic HTML5 entry point
├── index1.html      # Backward-compatible mirrored entry point
├── stylee.css       # Complete CSS3 design system (variables, themes, animations, responsive)
├── script.js        # Modular Vanilla JavaScript (State, CRUD, Filters, Storage, UI)
├── todolist.jpg     # Favicon / brand asset
└── README.md        # Comprehensive documentation
```

---

## 🚀 Getting Started

No package manager, build tool, or installation is required!

### Option 1: Direct Browser Launch
1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/task-manager.git
   ```
2. Navigate to the project directory:
   ```bash
   cd task-manager
   ```
3. Open `index.html` directly in your favorite web browser (Google Chrome, Firefox, Safari, Microsoft Edge).

### Option 2: Run with Local HTTP Server (Optional)
Using Python:
```bash
python -m http.server 3000
```
Then visit `http://localhost:3000` in your browser.

Using Node.js (`npx serve`):
```bash
npx serve .
```

---

## 🛠️ Tech Stack & Engineering Highlights

- **HTML5**: Semantic tags (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`, `<dialog>`), fully accessible with ARIA attributes (`aria-label`, `role="tablist"`, `aria-live`).
- **CSS3**:
  - CSS Custom Properties (`--bg-primary`, `--primary`, `--border-color`, etc.) for scalable theme switching.
  - Flexbox and CSS Grid layouts for modern, robust responsiveness.
  - Cubic-bezier transitions and CSS keyframe animations (`fadeIn`, `slideDown`, `slideInRight`).
  - Native calendar picker styling and custom accessible checkboxes.
- **Vanilla JavaScript (ES6+)**:
  - State-driven architecture (unidirectional rendering flow).
  - Pure filter and sort utility functions.
  - XSS defense via string escaping and native DOM property manipulation (`textContent`, `createElement`).
  - Error-resilient JSON serialization with `try...catch` safeguards.

---

## 🧪 Testing & Verification

TaskFlow includes an automated verification test suite checking:
- DOM element ID parity and consistency across HTML and JavaScript.
- Dynamic CSS class definitions and theme selector coverage.
- CRUD functional logic (task validation, completion toggling, editing, deletion).
- Search query matching (title, category, and notes).
- Sorting algorithms (due date, priority weighting, creation time, alphabetical).
- Task statistics calculation and completion rate percentage logic.

To run the verification suite:
```bash
node test_suite.js
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal and commercial use.
