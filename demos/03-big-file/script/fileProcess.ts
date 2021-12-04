import { request } from "../../utils.js";
import { onProgressCreator, renderChunkProgress } from "./progress.js";

const SIZE = 10 * 1024 * 1024; // 10MB per chunk

function createFileChunk(file: File, chunkSize: number = SIZE) {
  const fileChunks = [];

  let total = 0;
  let index = 1;

  while (total < file.size) {
    fileChunks.push({
      chunk: file.slice(total, total + chunkSize),
      hash: `${file.name}-${index}`,
    });

    total += chunkSize;
    index++;
  }

  // render the  progress UI
  renderChunkProgress(fileChunks);

  return fileChunks;
}

// type FileChunks = Array<ChunkType>;

export async function mergeFileRequest(fileName: string) {
  return await request({
    url: "/big-file/merge",
    method: "GET",
    queryParams: { fileName },
  });
}

export async function uploadFile(file: File) {
  const fileChunks = createFileChunk(file);

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
        onProgress: onProgressCreator(fileChunks[index]),
      });
    });

  return await Promise.all(requestList);
}
