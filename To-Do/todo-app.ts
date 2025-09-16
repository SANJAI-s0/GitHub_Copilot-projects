type Priority = "High" | "Medium" | "Low";
type Todo = {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate?: string; // ISO date string
};

type Filter = "all" | "active" | "completed";
type PriorityFilter = "All" | Priority;

class TodoApp {
  private todos: Todo[] = [];
  private storageKey = "todoList";
  private filter: Filter = "all";
  private priorityFilter: PriorityFilter = "All";

  constructor() {
    this.todos = this.loadTodos();
  }

  private saveTodos() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.todos));
  }

  private loadTodos(): Todo[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  addTodo(text: string, priority: Priority = "Medium", dueDate?: string) {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
      priority,
      dueDate: dueDate || undefined,
    };
    this.todos.push(newTodo);
    this.saveTodos();
    return newTodo;
  }

  toggleTodo(id: number) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    this.saveTodos();
  }

  updateTodo(id: number, newText: string, newPriority?: Priority, newDueDate?: string) {
    this.todos = this.todos.map(todo =>
      todo.id === id
        ? {
            ...todo,
            text: newText,
            priority: newPriority ?? todo.priority,
            dueDate: newDueDate !== undefined ? newDueDate : todo.dueDate,
          }
        : todo
    );
    this.saveTodos();
  }

  removeTodo(id: number) {
    this.todos = this.todos.filter(todo => todo.id !== id);
    this.saveTodos();
  }

  clearCompleted() {
    this.todos = this.todos.filter(todo => !todo.completed);
    this.saveTodos();
  }

  setFilter(filter: Filter) {
    this.filter = filter;
  }

  setPriorityFilter(priority: PriorityFilter) {
    this.priorityFilter = priority;
  }

  getTodos(): Todo[] {
    let filtered = this.todos;

    // Filter by completion status
    switch (this.filter) {
      case "active":
        filtered = filtered.filter(todo => !todo.completed);
        break;
      case "completed":
        filtered = filtered.filter(todo => todo.completed);
        break;
    }

    // Filter by priority
    if (this.priorityFilter !== "All") {
      filtered = filtered.filter(todo => todo.priority === this.priorityFilter);
    }

    // Sort by priority: High > Medium > Low
    filtered = filtered.slice().sort((a, b) => {
      const prioOrder: Record<Priority, number> = { High: 1, Medium: 2, Low: 3 };
      return prioOrder[a.priority] - prioOrder[b.priority];
    });

    return filtered;
  }

  getCounts() {
    return {
      total: this.todos.length,
      completed: this.todos.filter(todo => todo.completed).length,
      active: this.todos.filter(todo => !todo.completed).length,
    };
  }

  getCurrentFilter() {
    return this.filter;
  }

  getCurrentPriorityFilter() {
    return this.priorityFilter;
  }

  markAll(completed: boolean) {
    this.todos = this.todos.map(todo => ({ ...todo, completed }));
    this.saveTodos();
  }
}

// --- DOM hooks and rendering ---

const app = new TodoApp();

function isOverdue(todo: Todo) {
  if (!todo.dueDate || todo.completed) return false;
  const today = new Date().toISOString().slice(0, 10);
  return todo.dueDate < today;
}

function render() {
  const todoList = document.getElementById("todo-list")!;
  todoList.innerHTML = "";

  app.getTodos().forEach(todo => {
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    if (isOverdue(todo)) li.classList.add("overdue");

    // Priority badge
    const badge = document.createElement("span");
    badge.textContent = todo.priority;
    badge.className = `priority-badge priority-${todo.priority.toLowerCase()}`;
    li.appendChild(badge);

    // Due date badge
    if (todo.dueDate) {
      const due = document.createElement("span");
      due.textContent = `Due: ${todo.dueDate}`;
      due.className = "due-badge";
      li.appendChild(due);
    }

    // Inline editing
    const span = document.createElement("span");
    span.textContent = todo.text;
    span.className = "todo-text";
    span.ondblclick = () => {
      startEditTodo(todo, li, span, badge);
    };

    if (todo.completed) span.style.textDecoration = "line-through";

    // Toggle complete on click (not on edit)
    span.onclick = (e) => {
      if ((e.target as HTMLElement).classList.contains("edit-input")) return;
      app.toggleTodo(todo.id);
      render();
    };

    li.appendChild(span);

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "edit-btn";
    editBtn.onclick = (e) => {
      e.stopPropagation();
      startEditTodo(todo, li, span, badge);
    };
    li.appendChild(editBtn);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = (e) => {
      e.stopPropagation();
      app.removeTodo(todo.id);
      render();
    };
    li.appendChild(delBtn);

    todoList.appendChild(li);
  });

  // Render counts
  const counts = app.getCounts();
  document.getElementById("counts")!.textContent =
    `Total: ${counts.total} | Active: ${counts.active} | Completed: ${counts.completed}`;

  // Update filter buttons
  ["all", "active", "completed"].forEach(f => {
    const btn = document.getElementById(`filter-${f}`)!;
    btn.className = app.getCurrentFilter() === f ? "filter-btn active" : "filter-btn";
  });

  // Update priority filter
  const prioFilter = document.getElementById("priority-filter") as HTMLSelectElement;
  prioFilter.value = app.getCurrentPriorityFilter();
}

function startEditTodo(todo: Todo, li: HTMLLIElement, span: HTMLSpanElement, badge: HTMLSpanElement) {
  // Remove existing edit input if any
  const existingInput = li.querySelector(".edit-input") as HTMLInputElement;
  if (existingInput) return;

  // Edit text input
  const input = document.createElement("input");
  input.type = "text";
  input.value = todo.text;
  input.className = "edit-input";
  input.size = Math.max(20, todo.text.length + 2);

  // Edit priority select
  const prioritySelect = document.createElement("select");
  prioritySelect.className = "edit-priority";
  ["High", "Medium", "Low"].forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    if (todo.priority === p) option.selected = true;
    prioritySelect.appendChild(option);
  });

  // Edit due date
  const dueDateInput = document.createElement("input");
  dueDateInput.type = "date";
  dueDateInput.value = todo.dueDate || "";
  dueDateInput.className = "edit-due-date";

  // Replace text and badge with input, select, date
  li.replaceChild(input, span);
  li.replaceChild(prioritySelect, badge);

  // Insert dueDateInput after prioritySelect
  li.insertBefore(dueDateInput, input);

  input.focus();

  // Save on blur or Enter
  const save = () => {
    const newValue = input.value.trim();
    const newPriority = prioritySelect.value as Priority;
    const newDueDate = dueDateInput.value || undefined;
    if (newValue) {
      app.updateTodo(todo.id, newValue, newPriority, newDueDate);
    }
    render();
  };
  input.onblur = save;
  prioritySelect.onblur = save;
  dueDateInput.onblur = save;
  input.onkeydown = (e) => {
    if (e.key === "Enter") {
      input.blur();
      prioritySelect.blur();
      dueDateInput.blur();
    } else if (e.key === "Escape") {
      render();
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todo-form") as HTMLFormElement;
  form.onsubmit = (e) => {
    e.preventDefault();
    const input = document.getElementById("todo-input") as HTMLInputElement;
    const prioritySelect = document.getElementById("todo-priority") as HTMLSelectElement;
    const dueDateInput = document.getElementById("todo-due-date") as HTMLInputElement;
    if (input.value.trim()) {
      app.addTodo(input.value.trim(), prioritySelect.value as Priority, dueDateInput.value || undefined);
      input.value = "";
      prioritySelect.value = "Medium";
      dueDateInput.value = "";
      render();
    }
  };

  // Filter buttons
  ["all", "active", "completed"].forEach(f => {
    document.getElementById(`filter-${f}`)!.onclick = () => {
      app.setFilter(f as Filter);
      render();
    };
  });

  // Priority filter
  const prioFilter = document.getElementById("priority-filter") as HTMLSelectElement;
  prioFilter.onchange = () => {
    app.setPriorityFilter(prioFilter.value as PriorityFilter);
    render();
  };

  // Clear completed
  document.getElementById("clear-completed")!.onclick = () => {
    app.clearCompleted();
    render();
  };

  // Mark all completed/active
  document.getElementById("mark-all")!.onclick = () => {
    const counts = app.getCounts();
    app.markAll(counts.completed < counts.total);
    render();
  };

  render();
});