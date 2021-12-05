import { request, BuildWorker } from "../../utils.js";
import { onProgressCreator, renderChunkProgress } from "./progress.js";
import { progressContainer } from "./doms.js";
import genHashWorker from "./genHashWorker.js";

const SIZE = 10 * 1024 * 1024; // 10MB per chunk

export type ChunkType = {
  chunk: Blob;
  hash?: string;
};

type FileChunks = Array<ChunkType>;

export async function createFileChunk(file: File, chunkSize: number = SIZE) {
  const fileChunks = [];

  let total = 0;
  let index = 1;

  while (total < file.size) {
    fileChunks.push({
      chunk: file.slice(total, total + chunkSize),
      hash: "",
    });

    total += chunkSize;
    index++;
  }

  // generate real hash(only the hash for the whole file not chunks) for server
  const fileHash = await calculateHash(fileChunks);

  // add the hash for each chunk
  fileChunks.forEach((chunk, index) => {
    chunk.hash = `${fileHash}-${index + 1}`;
  });

  // render the  progress UI using the above hash
  renderChunkProgress(fileChunks);

  return fileChunks;
}

function calculateHash(fileChunks: FileChunks) {
  return new Promise((res) => {
    // use a worker to compute the hash
    // so that the render process wont be blocked
    const hashWorker = BuildWorker(genHashWorker);

    if (!hashWorker) return res("no worker");

    hashWorker.postMessage({ fileChunks });

    hashWorker.onmessage = (event) => {
      res(event.data.hash);
    };
  });
}

export async function mergeFileRequest(fileName: string, extendName: string) {
  return await request({
    url: "/big-file/merge",
    method: "GET",
    queryParams: { fileName, extendName, size: SIZE },
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
      // the filename is the hash
      formData.append("fileName", hash.split("-")[0]);

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
