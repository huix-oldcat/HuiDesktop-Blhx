/* eslint-disable accessor-pairs */
// API Version = 1

export declare class BasicWindow {
  get Left (): number;
  set Left (value: number);
  get Top (): number;
  set Top (value: number);
  set Width (value: number);
  set Height (value: number);
}

export declare class WorkingArea {
  get Left (): number;
  get Top (): number;
  get Width (): number;
  get Height (): number;
}

export declare class BasicScreen {
  get Width (): number;
  get Height (): number;
}

export declare class HuiDesktop {
  get ApiVersion (): number;

  get Window (): BasicWindow;
  get WorkingArea (): WorkingArea;
  get Screen (): BasicScreen;

  set TopMost (value: boolean);
  set DragMoveLeft (value: boolean);
  set DragMoveRight (value: boolean);
  set ShowInTaskbar (value: boolean);
  set ClickTransparent (value: boolean);
}

declare let huiDesktop: HuiDesktop
export default huiDesktop
