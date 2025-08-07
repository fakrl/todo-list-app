// Todo App JavaScript
class TodoApp {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTodos();
        this.bindEvents();
        this.render();
        this.setTodayDate();
    }

    // Set today's date as default in date input
    setTodayDate() {
        const dateInput = document.getElementById('dateInput');
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }

    // Bind all event listeners
    bindEvents() {
        // Form submission
        document.getElementById('todoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTodo();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Input validation
        document.getElementById('todoInput').addEventListener('input', () => {
            this.clearError();
        });

        document.getElementById('dateInput').addEventListener('change', () => {
            this.clearError();
        });
    }

    // Add new todo
    addTodo() {
        const todoInput = document.getElementById('todoInput');
        const dateInput = document.getElementById('dateInput');
        
        const text = todoInput.value.trim();
        const date = dateInput.value;

        // Validation
        if (!this.validateInput(text, date)) {
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            date: date,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.todos.unshift(todo); // Add to beginning of array
        this.saveTodos();
        this.render();
        
        // Reset form
        todoInput.value = '';
        this.setTodayDate();
        this.clearError();
    }

    // Validate input
    validateInput(text, date) {
        const errorElement = document.getElementById('errorMessage');
        
        if (!text) {
            this.showError('Please enter a task description.');
            return false;
        }

        if (text.length < 3) {
            this.showError('Task description must be at least 3 characters long.');
            return false;
        }

        if (text.length > 100) {
            this.showError('Task description must be less than 100 characters.');
            return false;
        }

        if (!date) {
            this.showError('Please select a date.');
            return false;
        }

        return true;
    }

    // Show error message
    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }

    // Clear error message
    clearError() {
        const errorElement = document.getElementById('errorMessage');
        errorElement.classList.remove('show');
    }

    // Toggle todo completion
    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveTodos();
            this.render();
        }
    }

    // Delete todo with animation
    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-id="${id}"]`);
        
        if (todoElement) {
            todoElement.classList.add('removing');
            
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.render();
            }, 300);
        }
    }

    // Set current filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.render();
    }

    // Get filtered todos
    getFilteredTodos() {
        const today = new Date().toDateString();
        
        switch (this.currentFilter) {
            case 'today':
                return this.todos.filter(todo => 
                    new Date(todo.date).toDateString() === today
                );
            
            case 'upcoming':
                return this.todos.filter(todo => 
                    new Date(todo.date) > new Date() && 
                    new Date(todo.date).toDateString() !== today
                );
            
            case 'overdue':
                return this.todos.filter(todo => 
                    new Date(todo.date) < new Date() && 
                    new Date(todo.date).toDateString() !== today &&
                    !todo.completed
                );
            
            default:
                return this.todos;
        }
    }

    // Get date status
    getDateStatus(dateStr) {
        const todoDate = new Date(dateStr);
        const today = new Date();
        const todayStr = today.toDateString();
        
        if (todoDate.toDateString() === todayStr) {
            return 'today';
        } else if (todoDate > today) {
            return 'upcoming';
        } else {
            return 'overdue';
        }
    }

    // Format date for display
    formatDate(dateStr) {
        const date = new Date(dateStr);
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Render todos
    render() {
        const todoList = document.getElementById('todoList');
        const emptyState = document.getElementById('emptyState');
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            todoList.innerHTML = '';
            emptyState.style.display = 'block';
            
            // Update empty state message based on filter
            const emptyMessages = {
                'all': 'No tasks yet. Add your first task above!',
                'today': 'No tasks for today.',
                'upcoming': 'No upcoming tasks.',
                'overdue': 'No overdue tasks.'
            };
            
            emptyState.querySelector('p').textContent = emptyMessages[this.currentFilter];
            return;
        }

        emptyState.style.display = 'none';
        
        todoList.innerHTML = filteredTodos.map(todo => {
            const dateStatus = this.getDateStatus(todo.date);
            const formattedDate = this.formatDate(todo.date);
            
            return `
                <div class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
                    <input 
                        type="checkbox" 
                        class="todo-checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="todoApp.toggleTodo(${todo.id})"
                    >
                    <div class="todo-content">
                        <div class="todo-text">${this.escapeHtml(todo.text)}</div>
                        <div class="todo-date">
                            <span class="date-badge ${dateStatus}">${dateStatus}</span>
                            ${formattedDate}
                        </div>
                    </div>
                    <button 
                        class="delete-btn" 
                        onclick="todoApp.deleteTodo(${todo.id})"
                        aria-label="Delete task"
                    >
                        Delete
                    </button>
                </div>
            `;
        }).join('');
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Save todos to localStorage
    saveTodos() {
        localStorage.setItem('todoApp_todos', JSON.stringify(this.todos));
    }

    // Load todos from localStorage
    loadTodos() {
        const saved = localStorage.getItem('todoApp_todos');
        if (saved) {
            try {
                this.todos = JSON.parse(saved);
            } catch (e) {
                console.error('Error loading todos:', e);
                this.todos = [];
            }
        }
    }

    // Get statistics
    getStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;
        
        return { total, completed, pending };
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to add todo
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        document.getElementById('todoForm').dispatchEvent(new Event('submit'));
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        document.getElementById('todoInput').value = '';
        document.getElementById('todoInput').blur();
        todoApp.clearError();
    }
});