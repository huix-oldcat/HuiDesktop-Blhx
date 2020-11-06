import ModelSettings from './modelSettings'
import MotionManager from './motionManager'
import ShapeManager from './shapeManager'
import UserSettings from './userSettings'

import 'pixi.js'
import 'pixi-spine'

/**
 * 单个角色
 */
export default class Character {
  animation: PIXI.spine.Spine
  modelSettings: ModelSettings
  userSettings: UserSettings
  shapeManager: ShapeManager
  motionManager: MotionManager

  constructor (animation: PIXI.spine.Spine, modelSettings: ModelSettings) {
    this.animation = animation
    this.modelSettings = modelSettings
    this.userSettings = UserSettings.readUserSettings(modelSettings)
    this.shapeManager = new ShapeManager(animation, modelSettings, this.userSettings.scale, this.userSettings.flip)
    this.motionManager = new MotionManager(animation, this.userSettings, this.shapeManager)
  }

  public static async loadCharacter (app: PIXI.Application, modelSettings: ModelSettings): Promise<Character> {
    // load assets
    const resources = await new Promise<Partial<Record<string, PIXI.LoaderResource>>>(
      resolve => app.loader.add(modelSettings.name, modelSettings.location).load((_, x) => resolve(x)))
    const characterResources = resources[modelSettings.name]
    if (characterResources === undefined) throw new Error('Cannot read resources')

    // create spine character
    return new Character(new PIXI.spine.Spine(characterResources.spineData), modelSettings)
  }

  /**
   * 角色上台
   * @param app PIXI App对象
   */
  public addToStage (app: PIXI.Application): void {
    app.stage.addChild(this.animation)
  }
}
