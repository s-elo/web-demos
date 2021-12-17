import { generateId, deleteItem } from "../../utils.js";

const notesContainer = document.querySelector(
  ".notes-container"
) as HTMLDivElement;
const addBtn = document.querySelector(".add-notes") as HTMLButtonElement;

type Note = {
  id: string;
  note: string;
};

initialNotes();
function initialNotes() {
  const notes = getNotes();

  if (notes.length === 0) return;

  notes.forEach((note) => {
    renderNote(note);
  });
}

addBtn.addEventListener("click", () => {
  renderNote();
});

function renderNote({ id, note }: Note = { id: "", note: "" }) {
  const noteBox = document.createElement("div");
  noteBox.classList.add("note-box");

  id = id === "" ? generateId() : id;

  const hasNote = note.trim() !== "";

  const noteHTML = `
    <header class="tool-bar">
        <button class="save ${
          hasNote ? "hidden" : ""
        }"><i class="far fa-save"></i></button>
        <button class="edit ${
          !hasNote ? "hidden" : ""
        }"><i class="far fa-edit"></i></button>
        <button class="delete"><i class="far fa-trash-alt"></i></button>
    </header>
    <textarea class="edit-area area ${
      hasNote ? "hidden" : ""
    }">${note}</textarea>
    <section class="area ${!hasNote ? "hidden" : ""}">${note}</section>
    `;

  noteBox.innerHTML = noteHTML;

  const saveBtn = noteBox.querySelector(".save") as HTMLButtonElement;
  const editBtn = noteBox.querySelector(".edit") as HTMLButtonElement;
  const deleteBtn = noteBox.querySelector(".delete") as HTMLButtonElement;
  const editArea = noteBox.querySelector(".edit-area") as HTMLTextAreaElement;
  const previewArea = noteBox.querySelector("section") as HTMLElement;

  saveBtn.addEventListener("click", () => {
    const newNote = editArea.value;

    if (newNote.trim() === "") return;

    previewArea.innerText = newNote;

    editArea.classList.add("hidden");
    previewArea.classList.remove("hidden");

    editBtn.classList.remove("hidden");
    saveBtn.classList.add("hidden");

    saveNote({
      id,
      note: newNote,
    });
  });

  editBtn.addEventListener("click", () => {
    previewArea.classList.add("hidden");
    editArea.classList.remove("hidden");

    saveBtn.classList.remove("hidden");
    editBtn.classList.add("hidden");
  });

  deleteBtn.addEventListener("click", () => {
    noteBox.remove();
    removeNote(id);
  });

  notesContainer.appendChild(noteBox);
}

function getNotes(): Note[] {
  const notes = localStorage.getItem("notes");

  return notes ? JSON.parse(notes) : [];
}

function saveNote({ id, note }: Note) {
  const notes = getNotes();

  const targetNote = notes.find((note) => note.id === id);

  if (targetNote) {
    targetNote.note = note;
  } else {
    notes.push({
      id,
      note,
    });
  }

  localStorage.setItem("notes", JSON.stringify(notes));
}

function removeNote(id: string) {
  const notes = getNotes();

  deleteItem(notes, (note) => note.id === id);

  localStorage.setItem("notes", JSON.stringify(notes));
}
