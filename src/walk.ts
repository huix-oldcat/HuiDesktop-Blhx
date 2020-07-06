import share, { AnimationStatus, changeToIdle, flipCharacter } from './share';
import { ModelSettings, UserSettings } from './config';

import TWEEN, { Tween } from '@tweenjs/tween.js';

export class WalkManager {
    modelSettings: ModelSettings;
    userSettings: UserSettings;
    animation: PIXI.spine.Spine;
    faceTo = false;
    tween?: Tween<Record<string, unknown>>;

    constructor(modelSettings: ModelSettings, userSettings: UserSettings) {
        if (share.animation == undefined) throw new Error();
        this.modelSettings = modelSettings;
        this.userSettings = userSettings;
        this.animation = share.animation;
        this.faceTo = userSettings.reverse;
        if (userSettings.walkRandom > 0)
            setInterval(() => {
                if (share.animationStatus != AnimationStatus.idle) return;
                let rand = Math.random() * userSettings.walkRandom;
                console.log(rand);
                if (rand < 1) this.walk();
            }, 1000);
    }

    calcMaxDis() {
        if (share.animation == undefined) throw new Error();
        if (this.faceTo) {
            return huiDesktop.Window.Left;
        } else {
            return huiDesktop.WorkingArea.Width + huiDesktop.WorkingArea.Left - huiDesktop.Window.Left - huiDesktop.Window.Width;
        }
    }

    stopWalking() {
        if (this.tween) this.tween.stop();
        changeToIdle(); 
    }

    walk() {
        if (share.animationStatus == AnimationStatus.walking) { this.stopWalking(); return; }
        if (share.animationStatus != AnimationStatus.idle) return;
        
        let maxDis = this.calcMaxDis();
        if (maxDis < 200 * this.userSettings.zoom) {
            this.faceTo = !this.faceTo;
            flipCharacter(this.faceTo, this.userSettings, this.modelSettings);
            maxDis = this.calcMaxDis();
        }
        let roundCount = Math.floor(Math.random() * Math.floor(maxDis / 200 / this.userSettings.zoom) + 1);
        this.tween = new TWEEN.Tween(<Record<string, unknown>><unknown>huiDesktop.Window)
            .to({ Left: huiDesktop.Window.Left + 200 * this.userSettings.zoom * roundCount * (this.faceTo ? -1 : 1) },
                1000 * this.animation.spineData.findAnimation('walk').duration * roundCount)
            .onStart(() => { share.animationStatus = AnimationStatus.walking, this.animation.state.setAnimation(0, 'walk', true); })
            .onComplete(() => { changeToIdle() })
            .start();
    }
};