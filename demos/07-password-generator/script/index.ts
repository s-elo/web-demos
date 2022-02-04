const form = document.querySelector("#pw-selection") as HTMLFormElement;

const generateBtn = document.querySelector(
  "#btn-generate"
) as HTMLButtonElement;

generateBtn.addEventListener("click", () => {
  const formData = new FormData(form);

  for (const [name, value] of formData) {
    console.log(name, typeof value);
  }
});
