import { UserSettings, ModelSettings } from "./config";

export enum AnimationStatus {
    idle,
    touching,
    dragging,
    flying,
    walking
}
export default class share {
    static animationStatus= AnimationStatus.idle;
    static animation?: PIXI.spine.Spine = undefined;
    static dancing = false;
};

export function changeToIdle() {
    if (share.animation == undefined) throw new Error();
    share.animationStatus = AnimationStatus.idle;
    share.animation.state.setAnimation(0, share.dancing ? 'dance' : 'stand2', true);
}

export function flipCharacter(faceTo: boolean, userSettings: UserSettings, modelSettings: ModelSettings) {
    if (share.animation == undefined) throw new Error();
    if (faceTo) {
        share.animation.skeleton.scaleX = -userSettings.zoom;
        share.animation.x = window.innerWidth - modelSettings.x0 * userSettings.zoom;
        huiDesktop.Window.Left -= huiDesktop.Window.Width - modelSettings.x0 * userSettings.zoom * 2;
    } else {
        share.animation.skeleton.scaleX = userSettings.zoom;
        share.animation.x = modelSettings.x0 * userSettings.zoom;
        huiDesktop.Window.Left += huiDesktop.Window.Width - modelSettings.x0 * userSettings.zoom * 2;
    }
}