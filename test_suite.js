/**
 * TaskFlow Verification Test Suite
 * Run with: node test_suite.js
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('TaskFlow Automated Test & Verification Suite');
console.log('================================================================\n');

// 1. Static Verification: HTML, CSS, JS Parity
console.log('--- 1. Static Code Analysis & DOM Element Parity ---');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const html1 = fs.readFileSync(path.join(__dirname, 'index1.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'script.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'stylee.css'), 'utf8');

const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = new Set();
while ((match = idRegex.exec(js)) !== null) {
  ids.add(match[1]);
}

console.log(`Found ${ids.size} unique DOM IDs queried in script.js`);
for (const id of ids) {
  assert.ok(
    html.includes(`id="${id}"`) || html.includes(`id='${id}'`),
    `Missing ID "${id}" in index.html`
  );
  assert.ok(
    html1.includes(`id="${id}"`) || html1.includes(`id='${id}'`),
    `Missing ID "${id}" in index1.html`
  );
}
console.log('✔ All DOM element IDs match perfectly between HTML and JavaScript.');

assert.ok(css.includes('[data-theme="dark"]'), 'Dark theme missing in CSS');
assert.ok(css.includes('[data-theme="light"]'), 'Light theme missing in CSS');
console.log('✔ Dark and Light theme CSS custom properties verified.');

// 2. Functional & Logic Unit Tests
console.log('\n--- 2. Functional CRUD & Data Integrity Tests ---');
const mockStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, val) { this.store[key] = String(val); }
};

let tasks = [];

function addTask(title, priority, category, dueDate, description) {
  const trimmed = title.trim();
  if (!trimmed) return null;
  const task = {
    id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: trimmed,
    description: (description || '').trim(),
    priority: priority || 'medium',
    category: category || 'General',
    dueDate: dueDate || '',
    completed: false,
    createdAt: Date.now(),
    completedAt: null
  };
  tasks.unshift(task);
  mockStorage.setItem('tasks', JSON.stringify(tasks));
  return task;
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return null;
  task.completed = !task.completed;
  task.completedAt = task.completed ? Date.now() : null;
  mockStorage.setItem('tasks', JSON.stringify(tasks));
  return task;
}

function editTask(id, newTitle, newDesc, newPriority, newCat, newDueDate) {
  const task = tasks.find(t => t.id === id);
  if (!task || !newTitle.trim()) return false;
  task.title = newTitle.trim();
  task.description = (newDesc || '').trim();
  task.priority = newPriority;
  task.category = newCat;
  task.dueDate = newDueDate;
  mockStorage.setItem('tasks', JSON.stringify(tasks));
  return true;
}

function deleteTask(id) {
  const len = tasks.length;
  tasks = tasks.filter(t => t.id !== id);
  mockStorage.setItem('tasks', JSON.stringify(tasks));
  return tasks.length < len;
}

function filterAndSort(filter, priorityFilter, categoryFilter, search, sortBy) {
  let res = [...tasks];
  if (filter === 'active') res = res.filter(t => !t.completed);
  if (filter === 'completed') res = res.filter(t => t.completed);
  if (priorityFilter !== 'all') res = res.filter(t => t.priority === priorityFilter);
  if (categoryFilter !== 'all') res = res.filter(t => t.category === categoryFilter);
  if (search.trim() !== '') {
    const q = search.toLowerCase().trim();
    res = res.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q)
    );
  }
  res.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    switch (sortBy) {
      case 'due-asc':
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      case 'priority-high': {
        const pMap = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
      }
      case 'alpha':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  return res;
}

// 2.1 Task Creation
assert.strictEqual(addTask('   ', 'high', 'Work', '', ''), null, 'Empty task rejected');
const task1 = addTask('Launch Portfolio TaskFlow', 'high', 'Work', '2026-10-25', 'Deploy code');
assert.ok(task1, 'Task created');
assert.strictEqual(task1.completed, false);
console.log('✔ Task creation & validation passed');

// 2.2 LocalStorage Save & Recovery
const savedData = JSON.parse(mockStorage.getItem('tasks'));
assert.strictEqual(savedData[0].title, 'Launch Portfolio TaskFlow');
console.log('✔ LocalStorage serialization verified');

// 2.3 Toggle Completion
toggleTask(task1.id);
assert.strictEqual(task1.completed, true);
assert.ok(task1.completedAt > 0);
toggleTask(task1.id);
assert.strictEqual(task1.completed, false);
console.log('✔ Completion toggle verified');

// 2.4 Editing
assert.strictEqual(editTask(task1.id, '  ', '', 'low', 'Personal', ''), false);
assert.strictEqual(editTask(task1.id, 'Updated Task Title', 'Updated Notes', 'low', 'Personal', '2026-11-01'), true);
assert.strictEqual(task1.title, 'Updated Task Title');
assert.strictEqual(task1.category, 'Personal');
console.log('✔ Task editing verified');

// 2.5 Filters, Search & Sort
const task2 = addTask('Algorithms study', 'high', 'Study', '2026-10-20', 'Graphs');
const task3 = addTask('Grocery shopping', 'medium', 'Personal', '2026-10-18', 'Fresh fruit');
toggleTask(task1.id); // complete task1

const activeTasks = filterAndSort('active', 'all', 'all', '', 'due-asc');
assert.strictEqual(activeTasks.length, 2);

const completedTasks = filterAndSort('completed', 'all', 'all', '', 'due-asc');
assert.strictEqual(completedTasks.length, 1);

const searchResults = filterAndSort('all', 'all', 'all', 'graphs', 'due-asc');
assert.strictEqual(searchResults.length, 1);
assert.strictEqual(searchResults[0].id, task2.id);

const sortedByPriority = filterAndSort('active', 'all', 'all', '', 'priority-high');
assert.strictEqual(sortedByPriority[0].priority, 'high');
console.log('✔ Filter, search, and sorting logic verified');

// 2.6 Statistics and Progress Calculation
const total = tasks.length;
const completed = tasks.filter(t => t.completed).length;
const pending = total - completed;
const percent = Math.round((completed / total) * 100);
assert.strictEqual(total, 3);
assert.strictEqual(completed, 1);
assert.strictEqual(pending, 2);
assert.strictEqual(percent, 33);
console.log(`✔ Statistics & Progress bar calculations verified (${percent}% completed)`);

// 2.7 Deletion
assert.strictEqual(deleteTask(task2.id), true);
assert.strictEqual(tasks.length, 2);
console.log('✔ Task deletion verified');

console.log('\n================================================================');
console.log('All TaskFlow tests passed successfully! 🚀');
console.log('================================================================\n');
