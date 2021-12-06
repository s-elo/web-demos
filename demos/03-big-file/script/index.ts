import {
  selectBtn,
  uploadBtn,
  uploadInput,
  pauseBtn,
  recoverBtn,
} from "./doms.js";
import {
  selectBtnClick,
  uploadInputChange,
  uploadBtnClick,
  pauseBtnClick,
  recoverBtnClick,
} from "./eventCallbacks.js";

selectBtn.addEventListener("click", selectBtnClick);

uploadInput.addEventListener("change", uploadInputChange);

uploadBtn.addEventListener("click", uploadBtnClick);

pauseBtn.addEventListener("click", pauseBtnClick);

recoverBtn.addEventListener("click", recoverBtnClick);
