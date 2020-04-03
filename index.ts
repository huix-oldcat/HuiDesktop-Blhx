import 'pixi.js';
import 'pixi-spine';
import 'tween.js';

interface ModelSettings {
    name: string;
    location: string;
    width: number;
    height: number;
    x0: number;
    y0: number;
};

enum LeftKeyFunction {
    void,
    touch,
    switchDance
};

enum RightKeyFunction {
    void,
    touch,
    switchDance
};

class UserSettings {
    posX = 0;
    posY = 0;
    left = LeftKeyFunction.void;
    right = RightKeyFunction.void;
    leftDrag = false;
    rightDrag = false;
    topMost = false;
    showInTaskbar = true;
    opacity = 1;
    zoom = 1;
    reverse = false;
    walk = false;
    free = false;
    version = 1;
    clickTransparent = false;
    constructor() {
        this.posY = huiDesktop.WorkingArea.Top + huiDesktop.WorkingArea.Height - modelSettings.height * userSettings.zoom + modelSettings.y0 * userSettings.zoom;
    }
};

let app: PIXI.Application;
let modelSettings: ModelSettings;
let userSettings: UserSettings;
let animation: PIXI.spine.Spine;

function saveUserSettings() {
    localStorage.setItem('cc.huix.blhx.' + modelSettings.name, JSON.stringify(userSettings));
}

function readUserSettings() {
    let item = localStorage.getItem('cc.huix.blhx.' + modelSettings.name);
    if (item == null) {
        userSettings = new UserSettings();
        saveUserSettings();
    } else {
        userSettings = <UserSettings>JSON.parse(item);
        correctSettings();
    }
}

function download(location: string) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', location + '?_=' + (Math.random() * 100000).toString());
    xhr.send();
    xhr.onreadystatechange=function()
    {
        if (xhr.readyState==4 && xhr.status==200)
        {
            modelSettings = <ModelSettings>JSON.parse(xhr.responseText);
            readUserSettings();
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

function correctSettings() {
    if (userSettings.version !== 1) userSettings = new UserSettings();
    if (userSettings.free && userSettings.walk) userSettings.free = false;
    if (userSettings.free == false) userSettings.posY = huiDesktop.WorkingArea.Top + huiDesktop.WorkingArea.Height - modelSettings.height * userSettings.zoom + modelSettings.y0 * userSettings.zoom;
    if (userSettings.zoom <= 0) userSettings.zoom = 1;
    if (userSettings.opacity > 1 || userSettings.opacity < 0) userSettings.opacity = 1;
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
    animation.skeleton.scaleX = (userSettings.reverse ? -1 : 1) * userSettings.zoom;
    animation.skeleton.scaleY = userSettings.zoom;
}

function setPosition() {
    animation.x = modelSettings.x0 * userSettings.zoom;
    animation.y = window.innerHeight - modelSettings.y0 * userSettings.zoom;
    if (userSettings.reverse) animation.x = window.innerWidth - animation.x + modelSettings.y0 * userSettings.zoom;
}

function setMix() {
    animation.stateData.defaultMix = 0.32;
}

enum AnimationStatus {
    idle,
    touching,
    dragging,
    flying
}

let danceMode = false;
let currentStatus = AnimationStatus.idle;
let tween: TWEEN.Tween;

function listenCompleteEvent(trackEntry: PIXI.spine.core.TrackEntry) {
    switch (trackEntry.animation.name) {
        case 'touch':
            if (currentStatus == AnimationStatus.touching) {
                currentStatus = AnimationStatus.idle;
                animation.state.setAnimation(0, danceMode ? 'dance' : 'stand2', true);
            }
            break;
    }
}

function touch() {
    if (currentStatus == AnimationStatus.idle) {
        currentStatus = AnimationStatus.touching;
        animation.state.setAnimation(0, 'touch', false);
    }
}

function switchDance() {
    danceMode = !danceMode;
    if (currentStatus == AnimationStatus.idle) animation.state.setAnimation(0, danceMode ? 'dance' : 'stand2', true);
}

function dragDown() {
    if (currentStatus == AnimationStatus.flying) tween.stop();
    animation.state.setAnimation(0, 'tuozhuai2', true);
    currentStatus = AnimationStatus.dragging;
}

function dragUp() {
    userSettings.posX = huiDesktop.Window.Left;
    if (userSettings.free) {
        userSettings.posX = huiDesktop.Window.Top;
        currentStatus = AnimationStatus.idle;
        animation.state.setAnimation(0, danceMode ? 'dance' : 'stand2', true);
    } else {
        currentStatus = AnimationStatus.flying;
        animation.state.setAnimation(0, danceMode ? 'dance' : 'stand2', true);
        tween = new TWEEN.Tween(huiDesktop.Window);
        let target = huiDesktop.WorkingArea.Top + huiDesktop.WorkingArea.Height - modelSettings.height * userSettings.zoom + modelSettings.y0 * userSettings.zoom;
        tween.to({ Top: target }, 0.666 * Math.abs(target - huiDesktop.Window.Top))
            .onComplete(function () {
                currentStatus = AnimationStatus.idle;
                if (danceMode) animation.state.setAnimation(0, danceMode ? 'dance' : 'stand2', true);
            });
        tween.start();
    }
    saveUserSettings();
}

function leftClick() {
    if (currentStatus == AnimationStatus.flying || currentStatus == AnimationStatus.dragging) return;
    switch (userSettings.left) {
        case LeftKeyFunction.touch:
            touch();
            break;
        case LeftKeyFunction.switchDance:
            switchDance();
            break;
    }
}

function rightClick() {
    if (currentStatus == AnimationStatus.flying || currentStatus == AnimationStatus.dragging) return;
    switch (userSettings.right) {
        case RightKeyFunction.touch:
            touch();
            break;
        case RightKeyFunction.switchDance:
            switchDance();
            break;
    }
}

function setLeftButton() {
    animation.on('mousedown', leftClick);
}

function setRightButton() {
    animation.on('rightdown', rightClick);
}

function loaded(_: PIXI.Loader, resources: Partial<Record<string, PIXI.LoaderResource>>) {
    animation = new PIXI.spine.Spine(resources.spineCharacter?.spineData);
    setMix();
    setScale();
    setPosition();
    setLeftButton();
    setRightButton();
    animation.state.addListener({complete: listenCompleteEvent})
    animation.interactive = true;
    animation.state.setAnimation(0, 'stand2', true);
    app.stage.addChild(animation);
    requestAnimationFrame(loop);
}

function loop() {
    requestAnimationFrame(loop);
    TWEEN.update();
    app.renderer.render(app.stage);
}

function requestSettings() {
    window.open('config.html', '设置', 'width=360, height=660');
}

let huiDesktop_DragMove_OnMouseLeftClick = leftClick;
let huiDesktop_DragMove_OnMouseRightClick = rightClick;
let huiDesktop_DragMove_OnMouseLeftDown = dragDown;
let huiDesktop_DragMove_OnMouseRightDown = dragDown;
let huiDesktop_DragMove_OnMouseLeftUp = dragUp;
let huiDesktop_DragMove_OnMouseRightUp = dragUp;

download(window.location.hash.substr(1));