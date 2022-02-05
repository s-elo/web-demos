const form = document.querySelector("#pw-selection") as HTMLFormElement;
const pwShow = document.querySelector(".pw") as HTMLSpanElement;

const generateBtn = document.querySelector(
  "#btn-generate"
) as HTMLButtonElement;

const selections = {
  uppers: `ABCDEFGHIJKLMNOPQRSTUVWXYZ`,
  lowers: `abcdefghijklmnopqrstuvwxyz`,
  numbers: `0123456789`,
  symbols: `~!@#$%^&*()_+=-`,
};

function getChar(type: keyof typeof selections) {
  return selections[type][Math.floor(Math.random() * selections[type].length)];
}

function generatePw(len: number, includes: (keyof typeof selections)[]) {
  const pw = [];

  // at least one for each include
  for (const selection of includes) {
    pw.push(getChar(selection));
  }

  for (let i = 0; i < len - includes.length; i++) {
    const randomType = includes[Math.floor(Math.random() * includes.length)];

    pw.push(getChar(randomType));
  }

  return pw.join("");
}

generateBtn.addEventListener("click", () => {
  const [[_, length], ...includes] = [...new FormData(form)];

  if (Number(length) < includes.length)
    return alert("The length can not be larger than the char types");

  pwShow.innerHTML = generatePw(
    Number(length),
    includes.map((x) => x[0]) as (keyof typeof selections)[]
  );
});
