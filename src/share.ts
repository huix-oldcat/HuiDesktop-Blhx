import PIXI from 'pixi.js'

import { UserSettings, ModelSettings } from './config'
import huiDesktop from './huiDesktop'

export enum AnimationStatus {
  idle,
  touching,
  dragging,
  flying,
  walking
}

export const share = {
  animationStatus: AnimationStatus.idle,
  animation: undefined as PIXI.spine.Spine | undefined,
  dancing: false
}

export function changeToIdle (): void {
  if (share.animation === undefined) throw new Error()
  share.animationStatus = AnimationStatus.idle
  share.animation.state.setAnimation(0, share.dancing ? 'dance' : 'stand2', true)
}

export function flipCharacter (faceTo: boolean, userSettings: UserSettings, modelSettings: ModelSettings): void {
  if (share.animation === undefined) throw new Error()
  if (faceTo) {
    share.animation.skeleton.scaleX = -userSettings.zoom
    share.animation.x = window.innerWidth - modelSettings.x0 * userSettings.zoom
    huiDesktop.Window.Left -= huiDesktop.Window.Width - modelSettings.x0 * userSettings.zoom * 2
  } else {
    share.animation.skeleton.scaleX = userSettings.zoom
    share.animation.x = modelSettings.x0 * userSettings.zoom
    huiDesktop.Window.Left += huiDesktop.Window.Width - modelSettings.x0 * userSettings.zoom * 2
  }
}
