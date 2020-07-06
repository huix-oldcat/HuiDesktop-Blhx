import * as PIXI from 'pixi.js';
import 'pixi-spine';
import TWEEN, { Tween } from '@tweenjs/tween.js';

import { MouseKeyFunction, UserSettings, ModelSettings, readUserSettings, saveUserSettings } from './config';
import share, { AnimationStatus } from './share';
import { WalkManager } from './walk';
import { DragManager } from './drag';

let app: PIXI.Application;
let modelSettings: ModelSettings;
let userSettings: UserSettings;
let walkMan: WalkManager;
let dragMan: DragManager;

function download(location: string) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', location + '?_=' + (Math.random() * 100000).toString());
    xhr.send();
    xhr.onreadystatechange=function()
    {
        if (xhr.readyState==4 && xhr.status==200)
        {
            modelSettings = <ModelSettings>JSON.parse(xhr.responseText);
            userSettings = readUserSettings(modelSettings);
            init();
        }
    }
}

function init() {
    setBasicWindow();
    app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        transparent: true,
        autoStart: false
    });
    app.view.style.opacity = userSettings.opacity.toString();
    document.body.appendChild(app.view);
    app.loader.add('spineCharacter', modelSettings.location).load(loaded);
}

function setBasicWindow() {
    let expectedWidth = Math.round(modelSettings.width * userSettings.zoom);
    let expectedHeight = Math.round(modelSettings.height * userSettings.zoom);
    if (huiDesktop.Window.Width != expectedWidth || huiDesktop.Window.Height != expectedHeight) {
        huiDesktop.Window.Width = modelSettings.width * userSettings.zoom;
        huiDesktop.Window.Height = modelSettings.height * userSettings.zoom;
        window.location.reload();
        throw 'Need restart';
    }
    huiDesktop.Window.Left = userSettings.posX;
    huiDesktop.Window.Top = userSettings.posY;
    huiDesktop.TopMost = userSettings.topMost;
    huiDesktop.ShowInTaskbar = userSettings.showInTaskbar;
    huiDesktop.ClickTransparent = userSettings.clickTransparent;
    if (userSettings.leftDrag) huiDesktop.DragMoveLeft = true;
    if (userSettings.rightDrag) huiDesktop.DragMoveRight = true;
}

function setScale() {
    if (share.animation == undefined) throw new Error();
    share.animation.skeleton.scaleX = (userSettings.reverse ? -1 : 1) * userSettings.zoom;
    share.animation.skeleton.scaleY = userSettings.zoom;
}

function setPosition() {
    if (share.animation == undefined) throw new Error();
    share.animation.x = modelSettings.x0 * userSettings.zoom;
    share.animation.y = window.innerHeight - modelSettings.y0 * userSettings.zoom;
    if (userSettings.reverse) share.animation.x = window.innerWidth - share.animation.x + modelSettings.y0 * userSettings.zoom;
}

function setMix() {
    if (share.animation == undefined) throw new Error();
    share.animation.stateData.defaultMix = 0.32;
    share.animation.stateData.setMix('stand2', 'walk', 0.18);
    share.animation.stateData.setMix('dance', 'walk', 0.18);
}

function listenCompleteEvent(trackEntry: PIXI.spine.core.TrackEntry) {
    if (share.animation == undefined) throw new Error();
    switch (trackEntry.animation.name) {
        case 'touch':
            if (share.animationStatus == AnimationStatus.touching) {
                share.animationStatus = AnimationStatus.idle;
                share.animation.state.setAnimation(0, share.dancing ? 'dance' : 'stand2', true);
            }
            break;
    }
}

function touch() {
    if (share.animation == undefined) throw new Error();
    if (share.animationStatus == AnimationStatus.idle) {
        share.animationStatus = AnimationStatus.touching;
        share.animation.state.setAnimation(0, 'touch', false);
    }
}

function switchDance() {
    share.dancing = !share.dancing;
    if (share.animation == undefined) throw new Error();
    if (share.animationStatus == AnimationStatus.idle) share.animation.state.setAnimation(0, share.dancing ? 'dance' : 'stand2', true);
}

function leftClick() {
    if (share.animationStatus == AnimationStatus.flying || share.animationStatus == AnimationStatus.dragging) return;
    switch (userSettings.left) {
        case MouseKeyFunction.touch:
            touch();
            break;
        case MouseKeyFunction.switchDance:
            switchDance();
            break;
        case MouseKeyFunction.walk:
            walkMan.walk();
            break;
    }
}

function rightClick() {
    if (share.animationStatus == AnimationStatus.flying || share.animationStatus == AnimationStatus.dragging) return;
    switch (userSettings.right) {
        case MouseKeyFunction.touch:
            touch();
            break;
        case MouseKeyFunction.switchDance:
            switchDance();
            break;
        case MouseKeyFunction.walk:
            walkMan.walk();
            break;
    }
}

function setLeftButton() {
    if (share.animation == undefined) throw new Error();
    share.animation.on('mousedown', leftClick);
}

function setRightButton() {
    if (share.animation == undefined) throw new Error();
    share.animation.on('rightdown', rightClick);
}

function loaded(_: PIXI.Loader, resources: Partial<Record<string, PIXI.LoaderResource>>) {
    share.animation = new PIXI.spine.Spine(resources.spineCharacter?.spineData);
    walkMan = new WalkManager(modelSettings, userSettings);
    dragMan = new DragManager(modelSettings, userSettings, walkMan);
    setMix(), setScale(), setPosition();
    setLeftButton(), setRightButton();
    share.animation.state.addListener({complete: listenCompleteEvent})
    share.animation.interactive = true;
    share.animation.state.setAnimation(0, 'stand2', true);
    app.stage.addChild(share.animation);
    requestAnimationFrame(loop);
}

function loop(time: number) {
    if (share.animation == undefined) throw new Error();
    requestAnimationFrame(loop);
    TWEEN.update(time);
    app.renderer.render(app.stage);
}

function requestSettings() {
    window.open('config.html', '设置', 'width=370, height=790');
}

function triggerWalk() {
    walkMan.walk();
}

(<any>window).huiDesktop_DragMove_OnMouseLeftClick = leftClick;
(<any>window).huiDesktop_DragMove_OnMouseRightClick = rightClick;
(<any>window).requestSettings = requestSettings;
(<any>window).triggerWalk = triggerWalk;
(<any>window).remoteSaveUserSettings = () => { saveUserSettings(modelSettings.name, userSettings); window.location.reload(); }
(<any>window).remoteResetUserSettings = () => { saveUserSettings(modelSettings.name, userSettings = new UserSettings(modelSettings)); window.location.reload(); }

download(window.location.hash.substr(1));