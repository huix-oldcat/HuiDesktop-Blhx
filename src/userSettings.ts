import ModelSettings from './modelSettings'
import ShapeManager from './shapeManager'

export enum MouseKeyFunction {
  void,
  touch,
  switchDance,
  walk
}

export default class UserSettings {
  static readonly CURRENT_VERSION = 4
  readonly name: string
  posX = 0
  posY = 0
  left = MouseKeyFunction.void
  right = MouseKeyFunction.void
  leftDrag = false
  rightDrag = false
  topMost = false
  showInTaskbar = true
  opacity = 1
  scale = 1
  flip = false
  walkRandom = 0
  free = false
  clickTransparent = false
  version = UserSettings.CURRENT_VERSION

  public static readUserSettings (modelSettings: ModelSettings): UserSettings {
    // try to read this from local storage
    const settingsFeilds = UserSettings.readFromLocalStorage(modelSettings.name)
    if (settingsFeilds !== undefined && settingsFeilds.version === UserSettings.CURRENT_VERSION && settingsFeilds.name === modelSettings.name) {
      // 确保配置有效
      const settings = new UserSettings(modelSettings, settingsFeilds)
      settings.verify()
      if (!settings.free) { // 确保未设置可悬空的状态下小人落地
        settings.posY = ShapeManager.getGroundLocation(modelSettings.height, modelSettings.y0, settings.scale)
      }
      return settings
    } else {
      return new UserSettings(modelSettings)
    }
  }

  private static readFromLocalStorage (name: string): Record<string, any> | undefined {
    const item = localStorage.getItem(`cc.huix.blhx.${name}`)
    if (item === null) return
    try {
      return JSON.parse(item)
    } catch {
    }
  }

  public save (savePos = false): void {
    if (savePos) {
      this.posX = huiDesktop.Window.Left
      this.posY = huiDesktop.Window.Top
    }
    localStorage.setItem(`cc.huix.blhx.${this.name}`, JSON.stringify(this))
  }

  private constructor (modelSettings: ModelSettings, o?: Record<string, any>) {
    this.name = modelSettings.name
    this.posY = ShapeManager.getGroundLocation(modelSettings.height, modelSettings.y0, this.scale)
    if (o !== undefined) {
      this.posX = o.posX
      this.posY = 0
      this.left = o.left
      this.right = o.right
      this.leftDrag = o.leftDrag
      this.rightDrag = o.rightDrag
      this.topMost = o.topMost
      this.showInTaskbar = o.showInTaskbar
      this.opacity = o.opacity
      this.scale = o.scale
      this.flip = o.flip
      this.walkRandom = o.walkRandom
      this.free = o.free
      this.clickTransparent = o.clickTransparent
      this.version = o.version
    }
  }

  public verify (): void {
    if (this.scale <= 0) { // 确保正确缩放
      this.scale = 1
    }
    if (this.opacity > 1 || this.opacity < 0) { // 确保正确透明度
      this.opacity = 1
    }
  }

  public showSettings (document: Document): void {
    const on = <T extends HTMLElement>(name: string): T => {
      const obj = document.getElementById(name)
      if (obj == null) throw new Error(`${name} not found in the document`)
      return obj as T
    }
    const onSelect: (name: string) => HTMLSelectElement = on
    const onInput: (name: string) => HTMLInputElement = on
    onSelect('left-click').selectedIndex = this.left
    onSelect('right-click').selectedIndex = this.right
    onInput('dragmove-left').checked = this.leftDrag
    onInput('dragmove-right').checked = this.rightDrag
    onInput('top-most').checked = this.topMost
    onInput('show-in-taskbar').checked = this.showInTaskbar
    onInput('walk-random').value = this.walkRandom.toString()
    onInput('opacity').value = this.opacity.toString()
    onInput('zoom').value = this.scale.toString()
    onInput('reverse').checked = this.flip
    onInput('free').checked = this.free
    onInput('click-transparent').checked = this.clickTransparent
  }

  public saveSettings (document: Document): void {
    const on = <T extends HTMLElement>(name: string): T => {
      const obj = document.getElementById(name)
      if (obj == null) throw new Error(`${name} not found in the document`)
      return obj as T
    }
    const onSelect: (name: string) => HTMLSelectElement = on
    const onInput: (name: string) => HTMLInputElement = on
    this.left = onSelect('left-click').selectedIndex
    this.right = onSelect('right-click').selectedIndex
    this.leftDrag = onInput('dragmove-left').checked
    this.rightDrag = onInput('dragmove-right').checked
    this.topMost = onInput('top-most').checked
    this.showInTaskbar = onInput('show-in-taskbar').checked
    this.walkRandom = parseInt(onInput('walk-random').value)
    this.opacity = parseFloat(onInput('opacity').value)
    this.scale = parseFloat(onInput('zoom').value)
    this.flip = onInput('reverse').checked
    this.free = onInput('free').checked
    this.clickTransparent = onInput('click-transparent').checked
    this.verify()
    this.save()
  }
}
