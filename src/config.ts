import huiDesktop from './huiDesktop'

const SETTING_VERSION = 2

export enum MouseKeyFunction {
  void,
  touch,
  switchDance,
  walk
};

export interface ModelSettings {
  name: string
  location: string
  width: number
  height: number
  x0: number
  y0: number
};

export class UserSettings {
  posX = 0
  posY = 0
  left = MouseKeyFunction.void
  right = MouseKeyFunction.void
  leftDrag = false
  rightDrag = false
  topMost = false
  showInTaskbar = true
  opacity = 1
  zoom = 1
  reverse = false
  walkRandom = 0
  free = false
  version = SETTING_VERSION
  clickTransparent = false
  constructor (modelSettings: ModelSettings) {
    this.posY = huiDesktop.WorkingArea.Top + huiDesktop.WorkingArea.Height - modelSettings.height + modelSettings.y0
  }
};

function correctSettings (userSettings: UserSettings, modelSettings: ModelSettings): void {
  if (userSettings.version !== SETTING_VERSION) userSettings = new UserSettings(modelSettings)
  if (!userSettings.free) userSettings.posY = huiDesktop.WorkingArea.Top + huiDesktop.WorkingArea.Height - modelSettings.height * userSettings.zoom + modelSettings.y0 * userSettings.zoom
  if (userSettings.zoom <= 0) userSettings.zoom = 1
  if (userSettings.opacity > 1 || userSettings.opacity < 0) userSettings.opacity = 1
}

export function saveUserSettings (modelName: string, userSettings: UserSettings): void {
  userSettings.posX = huiDesktop.Window.Left
  userSettings.posY = huiDesktop.Window.Top
  localStorage.setItem('cc.huix.blhx.' + modelName, JSON.stringify(userSettings))
}

export function readUserSettings (modelSettings: ModelSettings): UserSettings {
  const item = localStorage.getItem('cc.huix.blhx.' + modelSettings.name)
  let settings: UserSettings
  if (item == null) {
    settings = new UserSettings(modelSettings)
    saveUserSettings(modelSettings.name, settings)
  } else {
    settings = JSON.parse(item) as UserSettings
    correctSettings(settings, modelSettings)
  }
  // (<any>window).userSettings = settings
  return settings
}
