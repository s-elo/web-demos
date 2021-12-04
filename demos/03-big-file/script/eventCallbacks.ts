import { selectBtn, uploadInput, fileNameDisplay } from "./doms.js";
import { uploadFile, mergeFileRequest } from "./fileProcess.js";

export function selectBtnClick() {
  uploadInput.click();
}

export function uploadInputChange() {
  if (!uploadInput.files) return;

  const [file] = uploadInput.files;

  // update the UI
  if (file.name) {
    fileNameDisplay.innerHTML = file.name;
    selectBtn.innerText = `Reselect`;
  }
}

type ResponseType = {
  hash: string;
  done: boolean;
};

export async function uploadBtnClick() {
  if (!uploadInput.files) return;

  const [file] = uploadInput.files;

  // upload chuncks concurrently
  const res = (await uploadFile(file)) as Array<ResponseType>;
  console.log(res);

  const isAllDone = (res: ResponseType) => res.done === true;

  // all chunks are received well, merge
  if (res.every(isAllDone)) {
    const res = await mergeFileRequest(file.name);

    console.log(res);
  }
}
