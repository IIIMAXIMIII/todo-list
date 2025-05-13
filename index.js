function createElement(tag, attributes, children, events) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
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
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      inputText: '',
      todos: [
        { id: 1, text: "Сделать домашку", completed: false },
        { id: 2, text: "Сделать практику", completed: false },
        { id: 3, text: "Пойти домой", completed: false }
      ]
    };
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
    const checkboxAttributes = {
      type: "checkbox",
      "data-id": todo.id,
      checked: todo.completed
    };

    return createElement("li", { key: todo.id }, [
      createElement("input", checkboxAttributes),
      createElement("label", {}, todo.text),
      createElement("button", { "data-id": todo.id }, "🗑️")
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
  document.body.appendChild(new TodoList().getDomNode());
});