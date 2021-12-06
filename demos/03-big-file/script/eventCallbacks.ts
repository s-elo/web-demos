import { selectBtn, uploadInput, fileNameDisplay, statusDom } from "./doms.js";
import {
  createFileChunk,
  calculateHash,
  uploadCheck,
  uploadFile,
  mergeFileRequest,
} from "./fileProcess.js";
import {
  renderChunkProgress,
  renderSwiftUploadProgress,
  setStatusAnimation,
} from "./progress.js";

type ResponseType = {
  hash: string;
  done: boolean;
};

// false: no click; true: uploading
let isUploading = false;

const isFileValidated = (uploadInput: HTMLInputElement) => {
  if (!uploadInput.files) return false;

  const [file] = uploadInput.files;

  if (!file || !file.name) return false;

  return file;
};

export function selectBtnClick() {
  uploadInput.click();
}

export function uploadInputChange() {
  const file = isFileValidated(uploadInput);

  if (file) {
    fileNameDisplay.innerHTML = file.name;
    selectBtn.innerText = `Reselect`;
  }
}

export async function uploadBtnClick() {
  // it is uploading
  if (isUploading) return alert("It is uploading a file");

  const file = isFileValidated(uploadInput);

  if (!file) return;

  isUploading = true;

  // 1. create the chunks
  const clearHashComputingStatus = setStatusAnimation(`Computing Hash`);

  const fileChunks = await createFileChunk(file);

  // 2. generate real hash(only the hash for the whole file not chunks) for server
  // note that after this, the hash has been added to each chunk
  const fileHash = (await calculateHash(fileChunks)) as string;

  // 3. render the  progress UI using the above hash
  renderChunkProgress(fileChunks);

  clearHashComputingStatus();

  // 4. see is it is uploaded
  // use the hash as filename
  const extendName = file.name.split(".")[1];

  const isUploaded = await uploadCheck(extendName, fileHash);

  // show the uploaded progress bars in a second
  if (isUploaded) return renderSwiftUploadProgress();

  // 5. upload the chunks concurrently
  const clearTransferStatus = setStatusAnimation(`Transferring`);

  const uploadRes = (await uploadFile(file, fileChunks)) as Array<ResponseType>;

  const isAllDone = (res: ResponseType) => res.done === true;

  // all chunks are received well, merge
  if (!uploadRes.every(isAllDone))
    return alert("upload failed, please upload again~");

  // 6. merge the chunks
  const mergeRes = (await mergeFileRequest(
    fileHash,
    extendName
  )) as ResponseType;

  clearTransferStatus();

  if (mergeRes.done) {
    statusDom.innerText = `Transfer Completed!`;
  } else {
    statusDom.innerText = `sth wrong, please upload again!`;
  }

  isUploading = false;
}
