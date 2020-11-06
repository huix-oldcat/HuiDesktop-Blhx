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

  public static async CreateSingleCharacterApp (modelSettingsLocation: string): Promise<HuiDesktopAzureLaneApplication> {
    // download model settings
    const file = await fetch(modelSettingsLocation).then(async (x) => await x.text())
    const modelSettings = JSON.parse(file) as ModelSettings

    // set the basic window directly -- only one character
    const userSettings = UserSettings.readUserSettings(modelSettings)
    const { width: exWidth, height: exHeight } = ShapeManager.getRectSize(modelSettings, userSettings.scale)
    huiDesktop.Window.Width = exWidth
    huiDesktop.Window.Height = exHeight
    huiDesktop.Window.Left = userSettings.posX
    huiDesktop.Window.Top = userSettings.posY
    huiDesktop.ClickTransparent = userSettings.clickTransparent
    huiDesktop.DragMoveLeft = userSettings.leftDrag
    huiDesktop.DragMoveRight = userSettings.rightDrag
    huiDesktop.ShowInTaskbar = userSettings.showInTaskbar
    huiDesktop.TopMost = userSettings.topMost

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
    (window as Record<string, any>).userSettings = character.userSettings;
    (window as ExtendedWindow).requestSettings = () => window.open('config.html', '设置', 'width=370, height=790')
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
