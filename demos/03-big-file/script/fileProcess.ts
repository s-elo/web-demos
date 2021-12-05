import { request, BuildWorker } from "../../utils.js";
import { onProgressCreator, renderChunkProgress } from "./progress.js";
import { progressContainer } from "./doms.js";
import genHashWorker from "./genHashWorker.js";

const SIZE = 10 * 1024 * 1024; // 10MB per chunk

export async function createFileChunk(file: File, chunkSize: number = SIZE) {
  const fileChunks = [];

  let total = 0;
  let index = 1;

  while (total < file.size) {
    fileChunks.push({
      chunk: file.slice(total, total + chunkSize),
      // the hash just for font-end UI
      // the real hash should be based on the content of the file
      // not the name of the file
      hash: `${file.name}-${index}`,
    });

    total += chunkSize;
    index++;
  }

  // render the  progress UI using the above hash
  renderChunkProgress(fileChunks);

  // generate real hash for server
  const ret = await calculateHash(fileChunks);

  console.log(ret);

  return fileChunks;
}

function calculateHash(fileChunks: FileChunks) {
  return new Promise((res) => {
    const hashWorker = BuildWorker(genHashWorker);

    if (!hashWorker) return res("no worker");

    hashWorker.postMessage({ fileChunks });

    hashWorker.onmessage = (event) => {
      res(event.data);
    };
  });
}

export type ChunkType = {
  chunk: Blob;
  hash: string;
};

type FileChunks = Array<ChunkType>;

export async function mergeFileRequest(fileName: string) {
  return await request({
    url: "/big-file/merge",
    method: "GET",
    queryParams: { fileName, size: SIZE },
  });
}

export async function uploadFile(file: File) {
  const fileChunks = await createFileChunk(file);

  const requestList = fileChunks
    .map((fileChunk) => {
      const { chunk, hash } = fileChunk;
      const formData = new FormData();

      // file
      formData.append("chunk", chunk);
      // fields
      formData.append("hash", hash);
      formData.append("fileName", file.name);

      return formData;
    })
    .map((formData, index) => {
      // return the promise, then run them concurrently
      return request({
        url: "/big-file/uploadFileChunks",
        method: "POST",
        data: formData,
        onProgress: onProgressCreator(fileChunks[index], file.size),
      });
    });

  return await Promise.all(requestList);
}
