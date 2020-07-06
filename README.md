## HuiDesktop Extension Package For Azur Lane

1. `npm install`

2. `npx webpack`

3. copy `dist/bundle.js` to `package/files/blhx/bundle.js`

4. pack `package/` folder using HuiDesktop DevelopTool

Based on HuiDesktop API V1, see `huiDesktop.d.ts`


## Tweak node_modules/@tweenjs/tween.js/dist/index.d.ts for proper Typescript types

```typescript
- declare module "TWEEN" {
+ declare module "@tweenjs/tween.js" {


    //...
    
    
-     class Tween<T extends UnknownProps> {
+     export class Tween<T extends UnknownProps> {
        //...
        duration(d: number): this;
-         start(time: number): this;
+         start(): this;
        private _setupProperties;
        stop(): this;
        end(): this;
    }

    //...
}

- declare module "@tweenjs/tween.js" {
-     import TWEEN from "TWEEN";
-     export = TWEEN;
- }

```