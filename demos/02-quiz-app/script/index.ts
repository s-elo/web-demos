import { Question } from "./type";
import { capFirstOne } from "../../utiles.js";

const questions = [
  {
    title: "what is the question?",
    ans_1: "this one",
    ans_2: "that one",
    ans_3: "no idea",
    ans_4: "guess",
    correct: 3,
  },
];
const questionTitle = document.querySelector(".question");
const answerSelect = document.querySelectorAll(".answer-select");
const answers = document.querySelectorAll(".answer");

function renderQuestion(question: Question) {
  (questionTitle as HTMLElement).innerHTML = capFirstOne(question.title);
  [...answers].forEach((ans, index) => {
    ans.innerHTML = capFirstOne((question as any)[`ans_${index + 1}`]);
  });
}

renderQuestion(questions[0]);
