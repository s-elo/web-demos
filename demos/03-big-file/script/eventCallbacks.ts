import { selectBtn, uploadInput, fileNameDisplay } from "./doms.js";
import {createFileChunk, uploadFile} from './fileProcess.js';

export function selectBtnClick() {
  uploadInput.click();
}

export function uploadInputChange() {
  if (!uploadInput.files) return;

  const [file] = uploadInput.files;

  if (file.name) {
    fileNameDisplay.innerHTML = file.name;
    selectBtn.innerText = `Reselect`;
  }
}

export async function uploadBtnClick() {
  if (!uploadInput.files) return;

  const [file] = uploadInput.files;
    
  const fileChunks = createFileChunk(file);

  await uploadFile(fileChunks);
}
