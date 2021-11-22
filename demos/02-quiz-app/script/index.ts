import { Question } from "./type";
import { capFirstOne } from "../../utiles.js";

const questions = [
  {
    title: "1. What is the question?",
    ans_1: "this one",
    ans_2: "that one",
    ans_3: "no idea",
    ans_4: "guess",
    correct: 3,
  },
  {
    title: "2. Who is the cheesy man?",
    ans_1: "you",
    ans_2: "me",
    ans_3: "he or she",
    ans_4: "guess",
    correct: 1,
  },
  {
    title: "3. How do youe think of this app?",
    ans_1: "silly",
    ans_2: "stupid",
    ans_3: "shitty",
    ans_4: "no idea",
    correct: 4,
  },
];

const questionTitle = document.querySelector(".question") as HTMLElement;
const answerSelect = document.querySelectorAll(
  ".answer-select"
) as NodeListOf<HTMLInputElement>;
const answers = document.querySelectorAll(".answer") as NodeListOf<HTMLElement>;
const submitBtn = document.querySelector("#submit-btn") as HTMLButtonElement;

let correctNum = 0;
let currentQuiz = 0;

renderQuestion(questions[0]);

function clearChecked(inputs: NodeListOf<HTMLInputElement>) {
  for (const input of [...inputs]) {
    input.checked = false;
  }
}

function renderQuestion(question: Question) {
  clearChecked(answerSelect);

  questionTitle.innerHTML = capFirstOne(question.title);
  [...answers].forEach((ans, index) => {
    ans.innerHTML = capFirstOne((question as any)[`ans_${index + 1}`]);
  });
}

function showResult() {
  return `<div class="result">You've answered ${correctNum}/${questions.length} questions correctly!</div>
    <button onclick="location.reload()">Do again</button>`;
}

function submitClick() {
  for (const [index, check] of [...answerSelect].entries()) {
    // answer correctly
    if (check.checked) {
      if (questions[currentQuiz].correct === index + 1) correctNum++;

      currentQuiz++;

      if (currentQuiz < questions.length) {
        // render the next question
        renderQuestion(questions[currentQuiz]);
      } else {
        questionTitle.parentElement!.innerHTML = showResult();
      }

      return;
    }
  }

  // no checked
  alert("You must select one");
}

submitBtn.addEventListener("click", submitClick);
