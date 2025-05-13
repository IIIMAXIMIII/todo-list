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

  getDomNode() {
    if (!this._domNode) {
      this._domNode = this.render();
    }
    return this._domNode;
  }

  update() {
    const newNode = this.render();
    if (this._domNode && this._domNode.parentNode) {
      this._domNode.parentNode.replaceChild(newNode, this._domNode);
    }
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
    this.setState({
      todos: this.state.todos.filter((t) => t.id !== id)
    });
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
    });
  }

  renderTodoItem(todo) {
    return createElement("li", {}, [
      createElement("input", {
        type: "checkbox",
        "data-id": todo.id,
        checked: todo.completed
      }, null, {
        change: () => this.toggleTodo(todo.id)
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
      createElement("button", { "data-id": todo.id }, "🗑️", {
        click: () => this.deleteTodo(todo.id)
      }),
    ]);
  }

  render() {
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
      createElement("ul", { id: "todos" },
        this.state.todos.map(todo => this.renderTodoItem(todo))
      ),
    ]);
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const todoList = new TodoList();
  document.body.appendChild(todoList.getDomNode());
});
