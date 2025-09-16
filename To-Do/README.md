# Todo App with Priority and Due Dates

A modern, feature-rich Todo application built with **TypeScript** for logic, **HTML5** for the structure, and **CSS3** for styling. Manage tasks with priorities, due dates, filtering, and inline editing, all saved in local storage.

---

## Table of Contents

- [Features](#features)
- [Files](#files)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Filtering & Sorting](#filtering--sorting)
- [Customization](#customization)
- [License](#license)

---

## Features

- Add tasks with **priority levels**: High, Medium, Low.
- Optional **due date** tracking with overdue highlighting.
- Toggle completion status and **edit tasks inline**.
- Filter tasks by **all, active, completed**.
- Filter tasks by **priority**.
- Clear completed tasks or mark all as done/undone.
- Persistent data storage using **localStorage**.
- Responsive UI with accessible buttons and forms.

---

## Files

| File          | Description                           |
|---------------|---------------------------------------|
| `index.html`  | Main HTML page — task form and list   |
| `todo-app.ts` | TypeScript logic for todo management  |
| `todo-app.css`| Stylesheet for layout and visuals     |

---

## Getting Started

1. Ensure all project files are in the same folder.
2. Compile `todo-app.ts` to JavaScript if necessary or use a bundler.
3. Open `index.html` in a modern web browser.
4. Use the UI to add, edit, filter, and manage tasks.

---

## Usage

- **Add Task**: Enter text, select priority and optional due date, then submit.
- **Toggle Complete**: Click task text to mark complete/incomplete.
- **Edit Task**: Double-click task text or use the Edit button to change text, priority, or due date.
- **Delete Task**: Click the Delete button to remove a task.
- **Filters**: Use filter buttons to show all, active, or completed tasks.
- **Priority Filter**: Select priority level to filter tasks by priority.
- **Clear Completed**: Remove all completed tasks with one button.
- **Mark All**: Toggle completion for all tasks.

Tasks with overdue dates and not completed are highlighted in red.

---

## Filtering & Sorting

- Tasks are filtered by completion status and priority.
- Tasks are sorted by priority: High > Medium > Low.

---

## Customization

- Modify `todo-app.css` to change colors, fonts, spacing, and layout.
- Extend or tweak logic in `todo-app.ts` for new features or data persistence methods.
- Enhance UI with transitions or accessibility improvements.

---

## License

This project is licensed under the MIT License.

