import {
  chunkProgressContainer,
  totalPercentDom,
  totalPercentNumDom,
} from "./doms.js";
import { setStyle } from "././../../utils.js";

type ChunkType = {
  chunk: Blob;
  hash: string;
};

const getOrder = (chunkHash: string) => Number(chunkHash.split("-")[1]);

// store the chunk loaded size
const chunkProgress: number[] = [];

function totalProgressSync(fileSize: number) {
  const totalPercent =
    (chunkProgress.reduce((total, percent) => total + percent, 0) / fileSize) *
    100;

  setStyle(totalPercentDom, {
    width: `${totalPercent.toFixed(0)}%`,
  });

  totalPercentNumDom.innerText = `${totalPercent.toFixed(0)}%`;
}

// create different function for each chunk
export function onProgressCreator(chunk: ChunkType, fileSize: number) {
  return (event: ProgressEvent<EventTarget>) => {
    // get the chunk index
    const order = getOrder(chunk.hash);

    const progressBar = document.querySelector(
      `#chunk-${order}`
    ) as HTMLDivElement;
    const progressNum = document.querySelector(
      `#chunk-${order}-num`
    ) as HTMLSpanElement;

    // calculate the chunk percentage
    const percent = (event.loaded / event.total) * 100;

    chunkProgress[order] = event.loaded;

    // sync the total progress UI
    totalProgressSync(fileSize);

    // sync the chunk progress UI
    setStyle(progressBar, {
      width: `${percent.toFixed(0)}%`,
    });

    progressNum.innerText = `${percent.toFixed(0)}%`;
  };
}

export function clearProgress() {
  setStyle(totalPercentDom, { width: "0%" });

  totalPercentNumDom.innerText = `0%`;

  chunkProgressContainer.innerHTML = "";

  chunkProgress.fill(0);
}

export function renderChunkProgress(chunks: Array<ChunkType>) {
  // clear (it has been cleared at the clearProgress func)
  // chunkProgressContainer.innerHTML = "";

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
