import { chunkProgressContainer, progressBar, progressNum } from "./doms.js";

type ChunkType = {
  chunk: Blob;
  hash: string;
};

const getOrder = (chunkHash: string) =>
  Number(chunkHash.split(".")[1].split("-")[1]);

// create different function for each chunk
export function onProgressCreator(chunk: ChunkType) {
  return (event: ProgressEvent<EventTarget>) => {
    console.log(event.loaded / event.total, chunk.hash);
    const progressBar = document.querySelector(
      `#chunk-${getOrder(chunk.hash)}`
    ) as HTMLDivElement;
    const progressNum = document.querySelector(
      `#chunk-${getOrder(chunk.hash)}-num`
    ) as HTMLSpanElement;

    console.log(progressBar);

    Object.assign(progressBar.style, {
      width: `${((event.loaded / event.total) * 100).toFixed(0)}%`,
    });
  };
}

export function renderChunkProgress(chunks: Array<ChunkType>) {
  // clear
  chunkProgressContainer.innerHTML = "";

  chunks.forEach(({ chunk, hash }) => {
    const progressHTML = `<div class="chunk-progress">
    <section class="chunk-name">${hash}</section>
    <section class="chunk-size">${(chunk.size / (1024 * 1024)).toFixed(
      2
    )}MB</section>
    <section class="progress-show">
      <span class="progress-bar-container">
        <div class="progress-bar" id="chunk-${getOrder(hash)}"></div>
      </span>
      <span class="progress-number" id="chunk-${getOrder(hash)}-num">0%</span>
    </section>
  </div>`;

    chunkProgressContainer.insertAdjacentHTML("beforeend", progressHTML);
  });
}
