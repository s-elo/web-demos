import { request } from "../../utils.js";

const SIZE = 10 * 1024 * 1024; // 10MB per chunk

export function createFileChunk(file: File, chunkSize: number = SIZE) {
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

  return fileChunks;
}

type FileChunks = Array<{
  chunk: Blob;
  hash: string;
}>;

export async function uploadFile(fileChunks: FileChunks) {
  const requestList = fileChunks
    .map((fileChunk) => {
      const { chunk, hash } = fileChunk;
      const formData = new FormData();

      formData.append("chunk", chunk);
      formData.append("hash", hash);

      return formData;
    })
    .map((formChunk) => {
      // return the promise, then run them concurrently
      return request({
        url: "/uploadFileChunks",
        method: "POST",
        data: formChunk,
      });
    });

  return await Promise.all(requestList);
}
