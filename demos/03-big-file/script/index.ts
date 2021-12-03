import { selectBtn, uploadBtn, uploadInput } from "./doms.js";
import {
  selectBtnClick,
  uploadInputChange,
  uploadBtnClick,
} from "./eventCallbacks.js";

selectBtn.addEventListener("click", selectBtnClick);

uploadInput.addEventListener("change", uploadInputChange);

uploadBtn.addEventListener("click", uploadBtnClick);
