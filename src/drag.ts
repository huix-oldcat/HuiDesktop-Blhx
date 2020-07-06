import share, { AnimationStatus, changeToIdle, flipCharacter } from './share';
import { ModelSettings, UserSettings, saveUserSettings } from './config';

import TWEEN, { Tween } from '@tweenjs/tween.js';
import { WalkManager } from './walk';

export class DragManager {
    walkMan: WalkManager;
    modelSettings: ModelSettings;
    userSettings: UserSettings;
    animation: PIXI.spine.Spine;
    tween?: Tween<Record<string, unknown>>;

    constructor(modelSettings: ModelSettings, userSettings: UserSettings, walkman: WalkManager) {
        if (share.animation == undefined) throw new Error();
        this.modelSettings = modelSettings;
        this.userSettings = userSettings;
        this.walkMan = walkman;
        this.animation = share.animation;
        (<any>window).huiDesktop_DragMove_OnMouseLeftDown = () => this.dragDown();
        (<any>window).huiDesktop_DragMove_OnMouseRightDown = () => this.dragDown();
        (<any>window).huiDesktop_DragMove_OnMouseLeftUp = () => this.dragUp();
        (<any>window).huiDesktop_DragMove_OnMouseRightUp = () => this.dragUp();
    }

    dragDown() {
        if (share.animationStatus == AnimationStatus.flying && this.tween) this.tween.stop();
        if (share.animationStatus == AnimationStatus.walking) this.walkMan.stopWalking();
        if (share.animation == undefined) throw new Error();
        share.animation.state.setAnimation(0, 'tuozhuai2', true);
        share.animationStatus = AnimationStatus.dragging;
    }
    
    dragUp() {
        if (share.animation == undefined) throw new Error();
        if (this.userSettings.free) {
            share.animationStatus = AnimationStatus.idle;
            share.animation.state.setAnimation(0, share.dancing ? 'dance' : 'stand2', true);
        } else {
            share.animationStatus = AnimationStatus.flying;
            share.animation.state.setAnimation(0, share.dancing ? 'dance' : 'stand2', true);
            this.tween = new TWEEN.Tween(<Record<string, unknown>><unknown>huiDesktop.Window);
            let target = huiDesktop.WorkingArea.Top + huiDesktop.WorkingArea.Height - this.modelSettings.height * this.userSettings.zoom + this.modelSettings.y0 * this.userSettings.zoom;
            this.tween.to({ Top: target }, 0.666 * Math.abs(target - huiDesktop.Window.Top))
                .onComplete(() => {
                    if (share.animation == undefined) throw new Error();
                    share.animationStatus = AnimationStatus.idle;
                    if (share.dancing) share.animation.state.setAnimation(0, share.dancing ? 'dance' : 'stand2', true);
                    saveUserSettings(this.modelSettings.name, this.userSettings);
                })
                .start();
        }
        saveUserSettings(this.modelSettings.name, this.userSettings);
    }
}