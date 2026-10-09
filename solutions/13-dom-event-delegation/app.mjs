let tasks = [
  { id: '1', title: 'Implementar loading', completed: true },
  { id: '2', title: 'Probar error 500', completed: false }
];

const form = document.querySelector('[data-form]');
const list = document.querySelector('[data-list]');
const status = document.querySelector('[data-status]');

function createTaskItem(task) {
  const item = document.createElement('li');
  item.className = 'task-item';
  item.dataset.taskId = task.id;
  item.dataset.completed = String(task.completed);

  const title = document.createElement('span');
  title.className = 'task-item__title';
  title.textContent = task.title;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.dataset.action = 'toggle';
  toggle.setAttribute('aria-label', task.completed ? `Marcar ${task.title} como pendiente` : `Completar ${task.title}`);
  toggle.textContent = task.completed ? '↶' : '✓';

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.dataset.action = 'delete';
  remove.setAttribute('aria-label', `Eliminar ${task.title}`);
  remove.textContent = '×';

  item.append(title, toggle, remove);
  return item;
}

function render() {
  list.replaceChildren(...tasks.map(createTaskItem));
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const title = String(data.get('title') ?? '').trim();
  if (!title) return;
  tasks = [...tasks, { id: crypto.randomUUID(), title, completed: false }];
  form.reset();
  render();
  status.textContent = `Tarea añadida: ${title}.`;
  form.elements.title.focus();
});

list.addEventListener('click', (event) => {
  const actionButton = event.target.closest('button[data-action]');
  if (!actionButton || !list.contains(actionButton)) return;
  const item = actionButton.closest('[data-task-id]');
  const taskId = item?.dataset.taskId;
  if (!taskId) return;

  if (actionButton.dataset.action === 'toggle') {
    tasks = tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task);
    status.textContent = 'Estado de la tarea actualizado.';
  }

  if (actionButton.dataset.action === 'delete') {
    const removed = tasks.find((task) => task.id === taskId);
    tasks = tasks.filter((task) => task.id !== taskId);
    status.textContent = removed ? `Tarea eliminada: ${removed.title}.` : 'Tarea eliminada.';
  }

  render();
});

render();
