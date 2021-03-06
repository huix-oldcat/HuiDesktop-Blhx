import Character from './character'
import ModelSettings from './modelSettings'
import ShapeManager from './shapeManager'
import UserSettings from './userSettings'

import TWEEN from '@tweenjs/tween.js'
import 'pixi.js'
import 'pixi-spine'

export default class HuiDesktopAzureLaneApplication {
  app: PIXI.Application
  character: Character

  public static async CreateSingleCharacterApp (modelSettings: ModelSettings): Promise<HuiDesktopAzureLaneApplication> {
    // set the basic window directly -- only one character
    const userSettings = UserSettings.readUserSettings(modelSettings)
    const { width: exWidth, height: exHeight } = ShapeManager.getRectSize(modelSettings, userSettings.scale)
    huiDesktop.window.width = exWidth
    huiDesktop.window.height = exHeight
    huiDesktop.window.left = userSettings.posX
    huiDesktop.window.top = userSettings.posY
    huiDesktop.clickTransparent = userSettings.clickTransparent
    huiDesktop.dragMoveLeft = userSettings.leftDrag
    huiDesktop.dragMoveRight = userSettings.rightDrag
    huiDesktop.showInTaskbar = userSettings.showInTaskbar
    huiDesktop.topMost = userSettings.topMost

    // directly create huidesktop azure-lane application
    const app = new PIXI.Application({ width: exWidth, height: exHeight, transparent: true, autoStart: false })
    const character = await Character.loadCharacter(app, modelSettings)
    return new HuiDesktopAzureLaneApplication(app, character)
  }

  private constructor (app: PIXI.Application, character: Character) {
    this.app = app
    this.character = character
    app.view.style.opacity = character.userSettings.opacity.toString()
    character.addToStage(app)
    document.body.appendChild(app.view);
    (window as Record<string, any>).userSettings = character.userSettings
    window.requestSettings = () => window.open('config.html', '设置', 'width=370, height=790')
  }

  public run (): void {
    this.character.motionManager.resetToIdel()
    this.app.start()
    requestAnimationFrame(time => { this.loop(time) })
  }

  private loop (time: number): void {
    TWEEN.update(time)
    this.app.renderer.render(this.app.stage)
    requestAnimationFrame(x => { this.loop(x) })
  }
}
