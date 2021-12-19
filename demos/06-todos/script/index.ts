import { generateId, deleteItem } from "../../utils.js";

const inputDom = document.querySelector("input") as HTMLInputElement;
const listContainer = document.querySelector("ul") as HTMLUListElement;

type Todo = {
  content: string;
  marked: boolean;
  id: string;
};

initialize();
function initialize() {
  const todos = getTodos();

  if (todos.length === 0) return;

  todos.forEach((todo) => {
    const { content, id, marked } = todo;
    addTodo(content, id, marked, false);
  });
}

inputDom.addEventListener("keyup", (event) => {
  const content = inputDom.value;

  if (event.key === "Enter" && content.trim() !== "") {
    addTodo(content);
    inputDom.value = "";
  }
});

function addTodo(
  content: string = "",
  id: string = "",
  marked: boolean = false,
  isNew: boolean = true
) {
  const liDom = document.createElement("li") as HTMLLIElement;

  liDom.innerText = content;

  id === "" && (id = generateId());

  marked && liDom.classList.add("marked");

  // right click
  liDom.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    console.log('remove');
    
    liDom.remove();

    removeTodo(id);
  });

  // left click
  liDom.addEventListener("click", () => {
    liDom.classList.toggle("marked");

    toggleMark(id);
  });

  listContainer.appendChild(liDom);

  isNew &&
    saveTodo({
      id,
      content,
      marked,
    });
}

function getTodos(): Array<Todo> {
  const todoStr = localStorage.getItem("todos");

  return todoStr ? JSON.parse(todoStr) : [];
}

function saveTodo(todo: Todo) {
  const todos = getTodos();

  todos.push(todo);

  localStorage.setItem("todos", JSON.stringify(todos));
}

function toggleMark(id: string) {
  const todos = getTodos();

  const todo = todos.find((todo) => todo.id === id);

  if (todo) {
    todo.marked = !todo.marked;
  }

  localStorage.setItem("todos", JSON.stringify(todos));
}

function removeTodo(id: string) {
  const todos = getTodos();
  
  deleteItem(todos, (todo) => todo.id === id);

  localStorage.setItem("todos", JSON.stringify(todos));
}
