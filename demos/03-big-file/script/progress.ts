import {
  chunkProgressContainer,
  totalPercentDom,
  totalPercentNumDom,
  statusDom,
} from "./doms.js";
import { setStyle } from "././../../utils.js";

type ChunkType = {
  chunk: Blob;
  hash: string;
};

const getOrder = (chunkHash: string) => Number(chunkHash.split("-")[1]);

// store the chunk loaded size
const chunkProgress: number[] = [];
let pauseTotalPercent = 0;

function totalProgressSync(fileSize: number) {
  // reset
  if (pauseTotalPercent === 100) pauseTotalPercent = 0;

  const totalPercent =
    (chunkProgress.reduce((total, percent) => total + percent, 0) / fileSize) *
    100;

  // only when the current total percent is greater than the pauseTotalPercent
  // the bar will move, and update the pauseTotalPercent
  if (totalPercent > pauseTotalPercent) {
    setStyle(totalPercentDom, {
      width: `${totalPercent.toFixed(0)}%`,
    });

    totalPercentNumDom.innerText = `${totalPercent.toFixed(0)}%`;

    // keep tracking the total percent for the recover stage
    pauseTotalPercent = totalPercent;
  }
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

export function renderUploadedProgress(uploadedChunks: Array<ChunkType>) {
  uploadedChunks.forEach((chunk, _) => {
    const progressBar = document.querySelector(
      `#chunk-${getOrder(chunk.hash)}`
    ) as HTMLDivElement;
    const progressNum = document.querySelector(
      `#chunk-${getOrder(chunk.hash)}-num`
    ) as HTMLSpanElement;

    setStyle(progressBar, { width: "100%" });
    progressNum.innerText = "100%";

    // sync the chunkProgress array
    chunkProgress[getOrder(chunk.hash)] = chunk.chunk.size;
  });
}

export function renderChunkProgress(chunks: Array<ChunkType>) {
  // clear (it has been cleared at the clearProgress func)
  // chunkProgressContainer.innerHTML = "";

  chunks.forEach(({ chunk, hash }, index) => {
    const progressHTML = `<div class="chunk-progress">
    <section class="chunk-name">${hash}</section>
    <section class="chunk-size">${(chunk.size / (1024 * 1024)).toFixed(
      2
    )}MB</section>
    <section class="progress-show">
      <span class="progress-bar-container">
        <div class="progress-bar" id="chunk-${index + 1}"></div>
      </span>
      <span class="progress-number" id="chunk-${
        index + 1
      }-num" style="color: #aaa3a3;">0%</span>
    </section>
  </div>`;

    chunkProgressContainer.insertAdjacentHTML("beforeend", progressHTML);
  });
}

export function renderSwiftUploadProgress(chunks: Array<ChunkType>) {
  setStyle(totalPercentDom, { width: "100%" });

  totalPercentNumDom.innerText = "100%";

  renderUploadedProgress(chunks);

  statusDom.innerText = `Transfer Completed!`;
}

export function setStatusAnimation(content: string) {
  statusDom.innerText = `${content}...`;

  let count = 1;
  const timer = setInterval(() => {
    statusDom.innerText = `${content}${".".repeat(count)}`;
    if (count === 3) {
      count = 1;
    } else {
      count++;
    }
  }, 1000);

  return () => {
    // maintain the three dots status
    statusDom.innerText = `${content}...`;
    clearInterval(timer);
  };
}
