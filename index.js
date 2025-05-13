function createElement(tag, attributes, children, events) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      if (key === "style" && typeof attributes[key] === "object") {
        Object.assign(element.style, attributes[key]);
      } else if (key === "checked") {
        element.checked = attributes[key]; // ← ключевой момент
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

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.update();
  }

  update() {
    const oldNode = this._domNode;
    const newNode = this.render();
    if (oldNode && oldNode.parentNode) {
      oldNode.parentNode.replaceChild(newNode, oldNode);
    }
    this._domNode = newNode;
  }

  getDomNode() {
    if (!this._domNode) {
      this._domNode = this.render();
    }
    return this._domNode;
  }

  update() {
    const newNode = this.render();
    this._domNode.replaceWith(newNode);
    this._domNode = newNode;
  }
}


class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      inputText: '',
      todos: [
        { id: 1, text: "Сделать домашку", completed: false },
        { id: 2, text: "Сделать практику", completed: false },
        { id: 3, text: "Пойти домой", completed: false },
      ],
    };
    this.nextId = 4;
  }

  toggleTodo(id) {
    const todo = this.state.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.update();
    }
  }

  deleteTodo(id) {
    this.state.todos = this.state.todos.filter((t) => t.id !== id);
    this.update();
  }

  addTodo(text) {
    const trimmed = text.trim();
    if (trimmed) {
      this.state.todos.push({ id: this.nextId++, text: trimmed, completed: false });
      this.update();
    }
  }

  bindEvents(container) {
    container.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        this.toggleTodo(id);
      });
    });

    container.querySelectorAll("button[data-id]").forEach((button) => {
      button.addEventListener("click", (e) => {
        const id = parseInt(e.target.getAttribute("data-id"));
        this.deleteTodo(id);
      });
    });

    container.querySelector("#add-btn").addEventListener("click", () => {
      const input = container.querySelector("#new-todo");
      this.addTodo(input.value);
      input.value = "";
    });
  }

  onAddInputChange = (e) => {
    this.setState({ inputText: e.target.value });
  }

  onAddTask = () => {
    if (!this.state.inputText.trim()) return;

    this.setState({
      todos: [
        ...this.state.todos,
        {
          id: Date.now(),
          text: this.state.inputText,
          completed: false
        }
      ],
      inputText: ''
    });
  }

  renderTodoItem(todo) {
    return createElement("li", {}, [
      createElement("input", {
        type: "checkbox",
        "data-id": todo.id,
        checked: todo.completed,
      }),
      createElement(
        "label",
        {
          style: {
            color: todo.completed ? "gray" : "black",
            marginLeft: "5px",
            marginRight: "10px",
          },
        },
        todo.text
      ),
      createElement("button", { "data-id": todo.id }, "🗑️"),
    ]);
  }

  render() {
    const container = createElement("div", { class: "todo-list" }, [
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
      createElement("ul", { id: "todos" },
          this.state.todos.map(todo => this.renderTodoItem(todo))
      ),
    ]);

    setTimeout(() => this.bindEvents(container), 0);
    return container;
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const todoList = new TodoList();
  document.body.appendChild(todoList.getDomNode());
});
