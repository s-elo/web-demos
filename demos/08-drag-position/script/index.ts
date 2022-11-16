const dragEl = document.querySelector("#box") as HTMLElement;
const infoPanelEl = document.querySelector("#info-panel") as HTMLElement;

class DragInfoPanel {
  private _left = 0;
  private _top = 0;
  private _clientX = 0;
  private _clientY = 0;
  private _offsetLeft = 0;
  private _offsetTop = 0;

  private _panelEl: HTMLElement | null = null;
  private _leftSlot: HTMLElement | null = null;
  private _topSlot: HTMLElement | null = null;
  private _clientXSlot: HTMLElement | null = null;
  private _clientYSlot: HTMLElement | null = null;
  private _offsetLeftSlot: HTMLElement | null = null;
  private _offsetTopSlot: HTMLElement | null = null;

  constructor(panelEl: HTMLElement) {
    if (!panelEl) return;

    this._panelEl = panelEl;
    this._leftSlot = panelEl.querySelector("#left");
    this._topSlot = panelEl.querySelector("#top");
    this._clientXSlot = panelEl.querySelector("#clientX");
    this._clientYSlot = panelEl.querySelector("#clientY");
    this._offsetLeftSlot = panelEl.querySelector("#offsetLeft");
    this._offsetTopSlot = panelEl.querySelector("#offsetTop");
  }

  get left() {
    return this._left;
  }

  get top() {
    return this._top;
  }

  get clientX() {
    return this._clientX;
  }

  get clientY() {
    return this._clientY;
  }

  get offsetLeft() {
    return this._offsetLeft;
  }

  get offsetTop() {
    return this._offsetTop;
  }

  set left(val: number) {
    this._left = val;
    if (!this._leftSlot) return;

    this._leftSlot.innerHTML = `left: ${val}px`;
  }

  set top(val: number) {
    this._top = val;
    if (!this._topSlot) return;

    this._topSlot.innerHTML = `top: ${val}px`;
  }

  set clientX(val: number) {
    this._clientX = val;
    if (!this._clientXSlot) return;

    this._clientXSlot.innerHTML = `clientX: ${val}px`;
  }

  set clientY(val: number) {
    this._clientY = val;
    if (!this._clientYSlot) return;

    this._clientYSlot.innerHTML = `clientY: ${val}px`;
  }

  set offsetLeft(val: number) {
    this._offsetLeft = val;
    if (!this._offsetLeftSlot) return;

    this._offsetLeftSlot.innerHTML = `offsetLeft: ${val}px`;
  }

  set offsetTop(val: number) {
    this._offsetTop = val;
    if (!this._offsetTopSlot) return;

    this._offsetTopSlot.innerHTML = `offsetTop: ${val}px`;
  }
}

const panel = new DragInfoPanel(infoPanelEl);

const drag = (
  dragEl: HTMLElement,
  getValidPos?: (
    left: number,
    top: number,
    offsetLeft: number,
    offsetTop: number
  ) => { left: number; top: number }
) => {
  const mouseDown = (downEvent: MouseEvent) => {
    const dx = downEvent.clientX - dragEl.offsetLeft;
    const dy = downEvent.clientY - dragEl.offsetTop;

    const mouseMove = (moveEvent: MouseEvent) => {
      const left = moveEvent.clientX - dx;
      const top = moveEvent.clientY - dy;

      const { left: validLeft, top: validTop } = getValidPos
      ? getValidPos(left, top, dragEl.offsetLeft, dragEl.offsetTop)
      : { left, top };

      dragEl.style.left = `${validLeft}px`;
      dragEl.style.top = `${validTop}px`;

      panel.left = validLeft;
      panel.top = validTop;
      panel.clientX = moveEvent.clientX;
      panel.clientY = moveEvent.clientY;
      panel.offsetLeft = dragEl.offsetLeft;
      panel.offsetTop = dragEl.offsetTop;
    };

    const mouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };

    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
  };

  document.addEventListener("mousedown", mouseDown);
};

drag(dragEl, (left, top) => {
  if (left <= 0) left = 0;
  if (top <= 0) top = 0;

  return {
    left,
    top,
  };
});
