import ShapeManager from './shapeManager'
import UserSettings, { MouseKeyFunction } from './userSettings'

import 'pixi.js'
import 'pixi-spine'
import { Tween } from '@tweenjs/tween.js'

export enum motion {
  idle,
  walking,
  dancing,
  flying,
  dragging,
  touching
}

/**
 * 管理角色的动作状态
 */
export default class MotionManager {
  private readonly _animation: PIXI.spine.Spine
  private readonly _userSettings: UserSettings
  private _shapeManager: ShapeManager
  private _currentMotion: motion
  private _tween: Tween<BasicWindow> | undefined
  private _dancing = false

  constructor (animation: PIXI.spine.Spine, userSettings: UserSettings, shapeManager: ShapeManager) {
    this._animation = animation
    this._userSettings = userSettings
    this._shapeManager = shapeManager
    this._currentMotion = motion.idle

    // set mix
    this._animation.stateData.defaultMix = 0.32

    // set drag
    this.dragInit()

    // set walk
    this.enableRandomWalk()

    // set the animation
    this._animation.state.addListener({ complete: this.onAnimationComplete })
    this._animation.interactive = true
    this._animation.on('mousedown', () => this.leftClick())
    this._animation.on('rightdown', () => this.rightClick())
  }

  private dragInit (): void {
    // these functions will be called when the window is begin dragging
    // in this application we don't care which mouse button is used
    const window_ = window as ExtendedWindow
    window_.huiDesktop_DragMove_OnMouseRightDown = () => this.dragDown()
    window_.huiDesktop_DragMove_OnMouseLeftDown = () => this.dragDown()
    window_.huiDesktop_DragMove_OnMouseLeftUp = () => this.dragUp()
    window_.huiDesktop_DragMove_OnMouseRightUp = () => this.dragUp()
  }

  private enableRandomWalk (): void {
    if (this._userSettings.walkRandom > 0) {
      setInterval(() => {
        if (this._currentMotion !== motion.idle) return
        const rand = Math.random() * this._userSettings.walkRandom
        if (rand < 1) this.startWalking()
      }, 1000)
    }
  }

  private leftClick (): void {
    if (this._currentMotion === motion.flying || this._currentMotion === motion.dragging) return
    switch (this._userSettings.left) {
      case MouseKeyFunction.touch:
        this.touch()
        break
      case MouseKeyFunction.switchDance:
        this.switchDance()
        break
      case MouseKeyFunction.walk:
        this._currentMotion === motion.walking ? this.startWalking() : this.resetToIdel()
        break
    }
  }

  private rightClick (): void {
    if (this._currentMotion === motion.flying || this._currentMotion === motion.dragging) return
    switch (this._userSettings.right) {
      case MouseKeyFunction.touch:
        this.touch()
        break
      case MouseKeyFunction.switchDance:
        this.switchDance()
        break
      case MouseKeyFunction.walk:
        this._currentMotion === motion.walking ? this.startWalking() : this.resetToIdel()
        break
    }
  }

  public onAnimationComplete (trackEntry: PIXI.spine.core.TrackEntry): void {
    switch (trackEntry.animation.name) {
      case 'touch':
        if (this.currentMotion === motion.touching) {
          this.resetToIdel()
        }
        break
    }
  }

  public get currentMotion (): motion {
    return this._currentMotion
  }

  public resetToIdel (): void {
    if (this._dancing) {
      this._currentMotion = motion.dancing
      this._animation.state.setAnimation(0, 'dance', true)
    } else {
      this._currentMotion = motion.idle
      this._animation.state.setAnimation(0, 'stand2', true)
    }
  }

  public switchDance (): void {
    this._dancing = !this._dancing
    this.resetToIdel()
  }

  public touch (): void {
    if (this._currentMotion === motion.idle) {
      this._currentMotion = motion.touching
      this._animation.state.setAnimation(0, 'touch', false)
    }
  }

  private dragDown (): void {
    // if not idle, stop the vice animation
    this._tween?.stop()
    this._currentMotion = motion.dragging
    this._animation.state.setAnimation(0, 'tuozhuai2', true)
  }

  private dragUp (): void {
    if (this._userSettings.free) {
      // don't need to fly
      this.resetToIdel()
      this._userSettings.save(true)
      return
    }

    const target = this._shapeManager.groundLocation

    this._tween = new Tween(huiDesktop.Window)
    this._tween.to({ Top: target }, 0.666 * Math.abs(target - huiDesktop.Window.Top)) // speed = 0.666ms * pixels
    this._tween.onStart(_ => { this._currentMotion = motion.flying })
    this._tween.onComplete(_ => { this.resetToIdel(); this._userSettings.save(true) })
    this._tween.start()
  }

  private startWalking (): void {
    let maxDis = this._shapeManager.maxWalkDistance
    if (maxDis < 200 * this._shapeManager.scale) { // dis = 200px (a whole animtion)
      this._shapeManager.flip = !this._shapeManager.flip
      maxDis = this._shapeManager.maxWalkDistance
    }

    const roundCount = Math.floor(Math.random() * Math.floor(maxDis / 200 / this._shapeManager.scale) + 1)
    const walkDistance = 200 * this._shapeManager.scale * roundCount
    const walkTime = 1000 * this._animation.spineData.findAnimation('walk').duration * roundCount

    this._tween = new Tween(huiDesktop.Window)
    this._tween.to({ Left: huiDesktop.Window.Left + walkDistance * (this._shapeManager.flip ? -1 : 1) }, walkTime)
    this._tween.onStart(_ => { this._currentMotion = motion.walking; this._animation.state.setAnimation(0, 'walk', true) })
    this._tween.onComplete(_ => { this.resetToIdel(); this._userSettings.save(true) })
    this._tween.start()
  }
}
