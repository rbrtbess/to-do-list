const form = document.querySelector('#todo-form');
const input = document.querySelector('#task');
const list = document.querySelector('#todo-items');
const template = document.querySelector('#task-template');

const STORAGE_KEY = 'todoTasks';
let tasksState = [];

const saveTasks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksState));
};

const loadTasks = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to load tasks from storage:', error);
        return [];
    }
};

const updateTaskState = (id, updates) => {
    tasksState = tasksState.map(task => task.id === id ? { ...task, ...updates } : task);
    saveTasks();
};

const removeTaskFromState = id => {
    tasksState = tasksState.filter(task => task.id !== id);
    saveTasks();
};

const bindTaskEvents = task => {
    const completeButton = task.querySelector('.task-complete');
    const deleteButton = task.querySelector('.task-delete');
    const id = task.dataset.id;

    completeButton.addEventListener('click', () => {
        task.classList.toggle('completed');
        const isCompleted = task.classList.contains('completed');
        updateTaskState(id, { completed: isCompleted });
    });

    deleteButton.addEventListener('click', () => {
        task.remove();
        removeTaskFromState(id);
    });
};

const createTaskElement = taskData => {
    const fragment = template.content.cloneNode(true);
    const task = fragment.querySelector('.task');
    const label = task.querySelector('.task-label');

    task.dataset.id = taskData.id;
    label.textContent = taskData.text;

    if (taskData.completed) {
        task.classList.add('completed');
    }

    bindTaskEvents(task);

    return task;
};

const renderTasks = tasks => {
    list.innerHTML = '';
    tasks.forEach(taskData => {
        const taskElement = createTaskElement(taskData);
        list.appendChild(taskElement);
    });
};

form.addEventListener('submit', event => {
    event.preventDefault();

    const text = input.value.trim();
    if (!text) {
        return;
    }

    const newTask = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36),
        text,
        completed: false,
    };

    tasksState = [...tasksState, newTask];
    saveTasks();

    const taskElement = createTaskElement(newTask);
    list.appendChild(taskElement);

    input.value = '';
    input.focus();
});

tasksState = loadTasks();

if (tasksState.length) {
    renderTasks(tasksState);
} else {
    list.querySelectorAll('.task').forEach(task => {
        if (!task.querySelector('.task-label')) {
            const label = document.createElement('span');
            label.className = 'task-label';
            label.textContent = task.textContent.trim();
            task.textContent = '';
            task.appendChild(label);
        }

        task.dataset.id = Date.now().toString(36);
        bindTaskEvents(task);
    });
}

