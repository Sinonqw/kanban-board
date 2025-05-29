document.addEventListener('DOMContentLoaded', () => {
    class Column {
        constructor(name, title, colorClass) {
            this.name = name;
            this.id = name + '-column';
            this.inputId = name + '-input';
            this.colorClass = colorClass;
            this.tasks = [];
            this.render(title);
            this.loadTasks();
        }

        render(title) {
            this.element = document.createElement('div');
            this.element.classList.add('column', this.colorClass);
            this.element.id = this.id;
            this.element.innerHTML = `
                <div class="column-header">
                    <h4>${title}</h4>
                </div>
                <ul class="task-list"></ul>
                <form class="addtask" id="${this.inputId}">
                    <input type="text" placeholder="Додати задачу...">
                    <button type="submit">Додати</button>
                </form>`;

            document.querySelector('.container').appendChild(this.element);

            this.taskList = this.element.querySelector('.task-list');
            this.input = this.element.querySelector(`#${this.inputId} input`);
            this.button = this.element.querySelector(`#${this.inputId} button`);

            this.button.addEventListener('click', (e) => {
                e.preventDefault();
                this.addTask(this.input.value);
                this.input.value = '';
            });

            this.taskList.addEventListener('dragover', (e) => this.onDragOver(e));
            this.taskList.addEventListener('drop', (e) => this.onDrop(e));
            this.taskList.addEventListener('dragenter', (e) => this.onDragEnter(e));
            this.taskList.addEventListener('dragleave', (e) => this.onDragLeave(e));
        }

        addTask(text) {
            if (!text.trim() || this.taskExits(text)) return;

            const task = document.createElement('li');
            task.draggable = true;
            task.classList.add('task');
            task.innerHTML = `<h4 class="task-name">${text} <span class="avatar"></span></h4>`;

            task.addEventListener('dblclick', () => {
                task.remove();
                this.tasks = this.tasks.filter(t => t !== text);
                this.saveTasks();
            });

            task.addEventListener('dragstart', (e) => this.onDragStart(e, task));
            task.addEventListener('dragend', (e) => this.onDragEnd(e));

            this.taskList.appendChild(task);
            this.tasks.push(text);
            this.saveTasks();
        }
        
        taskExits(text){
            return Array.from(document.querySelectorAll('.task')).some(task => task.querySelector('.task-name').textContent.trim() === text)
        }

        saveTasks() {
            localStorage.setItem(this.name, JSON.stringify(this.tasks));
        }

        loadTasks() {
            const savedTasks = JSON.parse(localStorage.getItem(this.name)) || [];
            savedTasks.forEach(task => this.addTask(task));
        }

        onDragStart(event, task) {
            event.dataTransfer.setData('text/plain', this.name);
            event.dataTransfer.setData('taskText', task.querySelector('.task-name').textContent.trim());
            event.target.classList.add('dragging');
        }

        onDragEnter(event) {
            event.preventDefault();
            this.element.style.filter = 'brightness(0.5)';
            this.element.style.transition = 'filter 0.3s ease';
        }

        onDragOver(event) {
            event.preventDefault();
            this.element.style.filter = 'brightness(0.5)';
            this.element.style.transition = 'filter 0.3s ease';
        }

        onDrop(event) {
            event.preventDefault();
            this.element.style.filter = '';
            this.element.style.transition = '';

            const taskText = event.dataTransfer.getData('taskText');
            if (!taskText) return;

            const draggedElement = document.querySelector('.dragging');
            if (draggedElement) {
                this.taskList.appendChild(draggedElement);
                draggedElement.classList.remove('dragging');

                const fromColumn = event.dataTransfer.getData('text/plain');

                if (fromColumn !== this.name) {
                    let fromTasks = JSON.parse(localStorage.getItem(fromColumn)) || [];
                    fromTasks = fromTasks.filter(t => t !== taskText);
                    localStorage.setItem(fromColumn, JSON.stringify(fromTasks));

                    this.tasks.push(taskText);
                }

                this.tasks = Array.from(this.taskList.querySelectorAll('.task')).map(task =>
                    task.querySelector('.task-name').textContent.trim()
                );
                this.saveTasks();
            }
        }

        onDragLeave(event) {
            this.element.style.filter = '';
            this.element.style.transition = '';
        }

        onDragEnd(event) {
            event.target.classList.remove('dragging');
            document.querySelectorAll('.column').forEach(col => {
                col.style.filter = '';
                col.style.transition = '';
            });
        }
    }

    const columns = [
        new Column('goals', 'У планах', 'goals'),
        new Column('work', 'В роботі', 'work'),
        new Column('complete', 'Завершено', 'complete'),
    ];
});
