function createElement(tag, attributes, children, events) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      if (key === "style" && typeof attributes[key] === "object") {
        Object.assign(element.style, attributes[key]);
      } else if (key === "checked") {
        element.checked = attributes[key];
      } else if (key.startsWith("on") && typeof attributes[key] === "function") {
        element.addEventListener(key.slice(2).toLowerCase(), attributes[key]);
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });
  }

  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  if (events) {
    Object.keys(events).forEach((eventName) => {
      element.addEventListener(eventName, events[eventName]);
    });
  }

  return element;
}

class Component {
  constructor() {
    this.state = {};
  }

  setState(newState, callback) {
    this.state = { ...this.state, ...newState };
    localStorage.setItem("todoListState", JSON.stringify(this.state));
    this.update();
    if (callback) callback();
  }

  getDomNode() {
    if (!this._domNode) {
      this._domNode = this.render();
    }
    return this._domNode;
  }

  update() {
    const oldNode = this._domNode;
    const active = document.activeElement;
    const selectionStart = active?.selectionStart;
    const selectionEnd = active?.selectionEnd;

    const newNode = this.render();

    if (oldNode && oldNode.parentNode) {
      oldNode.parentNode.replaceChild(newNode, oldNode);
    }

    this._domNode = newNode;

    if (active?.id === "new-todo") {
      const input = this._domNode.querySelector("#new-todo");
      if (input) {
        input.focus();
        if (selectionStart !== null && selectionEnd !== null) {
          input.setSelectionRange(selectionStart, selectionEnd);
        }
      }
    }
  }
}

class Task extends Component {
  constructor(todo, onToggle, onDelete, resetConfirmState) {
    super();
    this.todo = todo;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.resetConfirmState = resetConfirmState;
    this.state = { confirmDelete: false };
  }

  handleDelete = () => {
    if (!this.state.confirmDelete) {
      this.resetConfirmState();
      this.setState({ confirmDelete: true });
    } else {
      this.onDelete();
    }
  }

  render() {
    return createElement("li", {}, [
      createElement("input", {
        type: "checkbox",
        checked: this.todo.completed
      }, null, {
        change: () => this.onToggle()
      }),
      createElement("label", {
        style: {
          color: this.todo.completed ? "gray" : "black",
          marginLeft: "5px",
          marginRight: "10px",
        }
      }, this.todo.text),
      createElement("button", {
        style: {
          color: this.state.confirmDelete ? "white" : "black",
          backgroundColor: this.state.confirmDelete ? "red" : "transparent",
          border: "1px solid gray",
          cursor: "pointer"
        }
      }, "🗑️", {
        click: this.handleDelete
      }),
    ]);
  }
}

class TodoList extends Component {
  constructor() {
    super();

    const savedState = JSON.parse(localStorage.getItem("todoListState"));
    
    this.state = savedState || {
      inputText: '',
      todos: [
        { id: 1, text: "Сделать домашку", completed: false },
        { id: 2, text: "Сделать практику", completed: false },
        { id: 3, text: "Пойти домой", completed: false },
      ],
    };

    this.nextId = this.state.todos.length > 0 ? Math.max(...this.state.todos.map(todo => todo.id)) + 1 : 4;
    this._taskComponents = [];
  }

  toggleTodo(id) {
    const todo = this.state.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.updateState();
    }
  }

  deleteTodo(id) {
    this.setState({
      todos: this.state.todos.filter((t) => t.id !== id)
    }, this.updateState);
  }

  onAddInputChange = (e) => {
    this.setState({ inputText: e.target.value });
  }

  onAddTask = () => {
    const trimmed = this.state.inputText.trim();
    if (!trimmed) return;

    this.setState({
      todos: [
        ...this.state.todos,
        {
          id: this.nextId++,
          text: trimmed,
          completed: false
        }
      ],
      inputText: ''
    }, this.updateState);
  }

  updateState = () => {
    localStorage.setItem("todoListState", JSON.stringify(this.state));
    this.update();
  }

  render() {
    this._taskComponents = [];

    const todoItems = this.state.todos.map(todo => {
      const taskComponent = new Task(
        todo,
        () => this.toggleTodo(todo.id),
        () => this.deleteTodo(todo.id),
        () => {
          this._taskComponents.forEach(comp => {
            if (comp.todo.id !== todo.id) {
              comp.setState({ confirmDelete: false });
            }
          });
        }
      );
      this._taskComponents.push(taskComponent);
      return taskComponent.getDomNode();
    });

    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
          value: this.state.inputText
        }, null, {
          input: this.onAddInputChange
        }),
        createElement("button", { id: "add-btn" }, "+", {
          click: this.onAddTask
        })
      ]),
      createElement("ul", { id: "todos" }, todoItems),
    ]);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const todoList = new TodoList();
  document.body.appendChild(todoList.getDomNode());
});
