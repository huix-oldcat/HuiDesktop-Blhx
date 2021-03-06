/* eslint-disable accessor-pairs */
// API Version = 1

declare class BasicWindow {
  get left (): number;
  set left (value: number);
  get top (): number;
  set top (value: number);
  set width (value: number);
  set height (value: number);
}

declare class WorkingArea {
  get left (): number;
  get top (): number;
  get width (): number;
  get height (): number;
}

declare class BasicScreen {
  get width (): number;
  get height (): number;
}

declare class HuiDesktop {
  get apiVersion (): number;

  get window (): BasicWindow;
  get workingArea (): WorkingArea;
  get screen (): BasicScreen;

  set topMost (value: boolean);
  set dragMoveLeft (value: boolean);
  set dragMoveRight (value: boolean);
  set showInTaskbar (value: boolean);
  set clickTransparent (value: boolean);
}

declare interface Window {
  huiDesktop_DragMove_OnMouseRightClick: () => void
  huiDesktop_DragMove_OnMouseLeftClick: () => void
  huiDesktop_DragMove_OnMouseRightDown: () => void
  huiDesktop_DragMove_OnMouseLeftDown: () => void
  huiDesktop_DragMove_OnMouseLeftUp: () => void
  huiDesktop_DragMove_OnMouseRightUp: () => void
  requestSettings: () => void
}

declare let huiDesktop: HuiDesktop
