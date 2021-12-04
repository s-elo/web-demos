import { chunkProgressContainer, progressBar, progressNum } from "./doms.js";

type ChunkType = {
  chunk: Blob;
  hash: string;
};
// create different function for each chunk
export function onProgressCreator(chunk: ChunkType) {
  return (event: ProgressEvent<EventTarget>) => {
    console.log(event.loaded / event.total, chunk.hash);
    const progressBar = document.querySelector(
      `#chunk-${chunk.hash}`
    ) as HTMLDivElement;
    const progressNum = document.querySelector(
      `#chunk-${chunk.hash}-num`
    ) as HTMLSpanElement;

    Object.assign(progressBar.style, {
      width: `${(event.loaded / event.total * 100).toFixed(0)}%`,
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
        <div class="progress-bar" id="chunk-${hash}"></div>
      </span>
      <span class="progress-number" id="chunk-${hash}-num">0%</span>
    </section>
  </div>`;

    chunkProgressContainer.insertAdjacentHTML("beforeend", progressHTML);
  });
}
