import ModelSettings from './modelSettings'

import 'pixi.js'
import 'pixi-spine'

/**
 * 管理角色的缩放与翻转
 */
export default class ShapeManager {
  private _animation: PIXI.spine.Spine
  private _modelSettings: ModelSettings
  private _scale = 1
  private _flip = false

  constructor (animation: PIXI.spine.Spine, modelSettings: ModelSettings, scale?: number, flip?: boolean) {
    this._animation = animation
    this._modelSettings = modelSettings
    if (scale) this.scale = scale
    if (flip) this.flip = flip
    this.modifyPosition()
  }

  private modifyPosition (): void {
    this._animation.skeleton.scaleX = this._flip ? -this.scale : this.scale
    this._animation.skeleton.scaleY = this.scale
    this._animation.x = this._modelSettings.x0 * this.scale
    this._animation.y = window.innerHeight - this._modelSettings.y0 * this.scale
    if (this.flip) this._animation.x = window.innerWidth - this._animation.x + this._modelSettings.x0 * this.scale
  }

  public get scale (): number {
    return this._scale
  }

  public set scale (value: number) {
    this._scale = value
    this.modifyPosition()
  }

  public get flip (): boolean {
    return this._flip
  }

  public set flip (value: boolean) {
    this._flip = value
    this.modifyPosition()
  }

  /**
   * 确定容纳角色的矩形大小
   * @param modelSettings 模型配置
   * @param scale 缩放比例
   */
  public static getRectSize (modelSettings: ModelSettings, scale: number): {width: number, height: number} {
    return { width: Math.ceil(modelSettings.width * scale), height: Math.ceil(modelSettings.height * scale) }
  }

  public get rectSize (): {width: number, height: number} {
    return ShapeManager.getRectSize(this._modelSettings, this.scale)
  }

  /**
   * 计算地面坐标
   */

  public static getGroundLocation(height: number, y0: number, scale: number): number {
    return huiDesktop.WorkingArea.Top + huiDesktop.WorkingArea.Height - height * scale + y0 * scale
  }

  public get groundLocation(): number {
    return ShapeManager.getGroundLocation(this._modelSettings.height, this._modelSettings.y0, this.scale)
  }

  /**
   * 计算（按当前朝向）可平移的距离
   */
  public get maxWalkDistance(): number {
    if (this.flip) {
      return huiDesktop.Window.Left
    } else {
      return huiDesktop.WorkingArea.Width + huiDesktop.WorkingArea.Left - huiDesktop.Window.Left - huiDesktop.Window.Width
    }
  }
}
