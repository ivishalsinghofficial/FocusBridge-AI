export function initTasks() {
    document.getElementById('addSubTaskBtn').onclick = () => {
        const text = document.getElementById('subTaskInput').value.trim();
        if (!text) return;
        chrome.storage.local.get(['subTasks'], (res) => {
            const tasks = res.subTasks || [];
            tasks.push({ text: text, completed: false });
            chrome.storage.local.set({ subTasks: tasks }, () => {
                document.getElementById('subTaskInput').value = '';
                renderTasks(tasks);
            });
        });
    };
}

export function renderTasks(tasks) {
    const container = document.getElementById('taskList');
    if (!container) return;
    container.innerHTML = '';
    tasks.forEach((task, index) => {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `<input type="checkbox" ${task.completed ? 'checked' : ''}><span class="${task.completed ? 'completed' : ''}">${task.text}</span>`;
        div.querySelector('input').onchange = (e) => {
            tasks[index].completed = e.target.checked;
            chrome.storage.local.set({ subTasks: tasks }, () => renderTasks(tasks));
        };
        container.appendChild(div);
    });
}
