import { request } from "../../utils.js";

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

  return fileChunks;
}

// type FileChunks = Array<{
//   chunk: Blob;
//   hash: string;
// }>;

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
    .map((formData) => {
      // return the promise, then run them concurrently
      return request({
        url: "/big-file/uploadFileChunks",
        method: "POST",
        data: formData,
      });
    });

  return await Promise.all(requestList);
}
