import {
  selectBtn,
  uploadInput,
  recoverBtn,
  pauseBtn,
  fileNameDisplay,
  statusDom,
  totalPercentNumDom,
} from "./doms.js";
import {
  createFileChunk,
  calculateHash,
  uploadCheck,
  uploadFile,
  mergeFileRequest,
  FileChunks,
} from "./fileProcess.js";
import {
  clearProgress,
  renderChunkProgress,
  renderSwiftUploadProgress,
  renderUploadedProgress,
  setStatusAnimation,
} from "./progress.js";

type ResponseType = {
  hash: string;
  done: boolean;
};

type UploadCheckResponse = {
  isUploaded: Boolean;
  uploadedChunks: Array<string>;
};

// chunk upload xhr that has not been uploaded yet
// (abort last time)
const xhrList: Array<XMLHttpRequest> = [];

let fileHash = "";
let fileChunks: FileChunks;

// false: no click; true: uploading
let isUploading = false;
// need to be shared in uploadClik, pauseClick and recoverClick
let clearHashComputingStatus = () => {};
let clearTransferStatus = () => {};

const isFileValidated = (uploadInput: HTMLInputElement) => {
  if (!uploadInput.files) return false;

  const [file] = uploadInput.files;

  if (!file || !file.name) return false;

  return file;
};

export function selectBtnClick() {
  if (isUploading) return alert('It is uploading a file');
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

  // only the pause and recover stage can get the value
  const isPausing = fileHash !== "";

  // 0. clear the progress UI
  // if the hash can be accessed, it means we are pausing
  !isPausing && clearProgress();

  if (!isPausing) {
    // 1. create the chunks
    fileChunks = createFileChunk(file);

    clearHashComputingStatus = setStatusAnimation(`Computing Hash`);

    // 2. generate real hash(only the hash for the whole file not chunks) for server
    fileHash = (await calculateHash(fileChunks)) as string;

    // add the hash for each chunk
    fileChunks.forEach((chunk, index) => {
      chunk.hash = `${fileHash}-${index + 1}`;
    });

    clearHashComputingStatus();
  }

  // 3. render the  progress UI using the above hash
  // if the hash can be accessed, it means we are pausing, no need to rerender
  !isPausing && renderChunkProgress(fileChunks);

  // 4. see if it is uploaded or partially uploaded
  // use the hash as filename
  const extendName = file.name.split(".")[1];

  const { isUploaded, uploadedChunks: uploadedHashs } = (await uploadCheck(
    extendName,
    fileHash
  )) as UploadCheckResponse;

  if (isUploaded) {
    // show the uploaded progress bars in a second
    renderSwiftUploadProgress(fileChunks);

    // clear the file chunks and hash
    fileHash = "";
    fileChunks = [];

    isUploading = false;

    return;
  }

  // filter the uploaded chunks
  const uploadChunks = fileChunks.filter(
    (chunk) => !uploadedHashs.includes(chunk.hash)
  );

  // filter the chunks that need to be uploaded
  const uploadedChunks = fileChunks.filter((chunk) =>
    uploadedHashs.includes(chunk.hash)
  );

  renderUploadedProgress(uploadedChunks);

  // 5. upload the chunks concurrently
  clearTransferStatus = setStatusAnimation(`Transferring`);

  const uploadRes = (await uploadFile(
    file,
    uploadChunks,
    xhrList
  )) as Array<ResponseType>;

  const isMergeDone = await mergeFile(uploadRes, fileHash, extendName);

  clearTransferStatus();

  if (isMergeDone) {
    statusDom.innerText = `Transfer Completed!`;
  } else {
    statusDom.innerText = `sth wrong, please upload again!`;
  }

  // clear the file chunks and hash
  fileHash = "";
  fileChunks = [];

  isUploading = false;
}

async function mergeFile(
  uploadRes: Array<ResponseType>,
  fileHash: string,
  extendName: string
) {
  const isAllDone = (res: ResponseType) => res.done === true;

  // all chunks are received well, merge
  if (!uploadRes.every(isAllDone))
    return alert("upload failed, please upload again~");

  // 6. merge the chunks
  const mergeRes = (await mergeFileRequest(
    fileHash,
    extendName
  )) as ResponseType;

  return mergeRes.done;
}

export function pauseBtnClick() {
  recoverBtn.disabled = false;
  pauseBtn.disabled = true;
  recoverBtn.classList.remove("btn-disable");
  pauseBtn.classList.add("btn-disable");

  xhrList.forEach((xhr) => {
    xhr.abort();
  });

  // clear all the xhr
  xhrList.length = 0;

  // stop the animation
  clearTransferStatus();
}

export async function recoverBtnClick() {
  recoverBtn.disabled = true;
  pauseBtn.disabled = false;
  recoverBtn.classList.add("btn-disable");
  pauseBtn.classList.remove("btn-disable");

  // set being able to uploading again
  isUploading = false;

  await uploadBtnClick();

  const file = isFileValidated(uploadInput);

  if (!file) return;

  // clear the file chunks and hash
  fileHash = "";
  fileChunks = [];
}
