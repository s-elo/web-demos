import { selectBtn, uploadInput, fileNameDisplay, statusDom } from "./doms.js";
import { uploadFile, mergeFileRequest } from "./fileProcess.js";

export function selectBtnClick() {
  uploadInput.click();
}

export function uploadInputChange() {
  if (!uploadInput.files) return;

  const [file] = uploadInput.files;

  // update the UI
  if (file && file.name) {
    fileNameDisplay.innerHTML = file.name;
    selectBtn.innerText = `Reselect`;
  }
}

type ResponseType = {
  hash: string;
  done: boolean;
};

function setStatusAnimation() {
  statusDom.innerText = `Transferring...`;

  let count = 1;
  return setInterval(() => {
    statusDom.innerText = `Transferring${".".repeat(count)}`;
    if (count === 3) {
      count = 1;
    } else {
      count++;
    }
  }, 1000);
}

export async function uploadBtnClick() {
  if (!uploadInput.files) return;

  const [file] = uploadInput.files;

  if (!file) return;

  const statusTimer = setStatusAnimation();

  // upload chuncks concurrently
  const res = (await uploadFile(file)) as Array<ResponseType>;

  const isAllDone = (res: ResponseType) => res.done === true;

  // all chunks are received well, merge
  if (res.every(isAllDone)) {
    // use the hash as filename
    const fileName = res[0].hash.split("-")[0];
    const extendName = file.name.split(".")[1];

    const ret = (await mergeFileRequest(fileName, extendName)) as ResponseType;

    clearInterval(statusTimer);

    if (ret.done) {
      statusDom.innerText = `Transfer Completed!`;
    } else {
      statusDom.innerText = `sth wrong, please upload again!`;
    }
  }
}
