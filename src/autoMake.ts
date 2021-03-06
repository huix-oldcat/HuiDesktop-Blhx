import 'pixi.js'
import 'pixi-spine'

type LoaderReturnType = Partial<Record<string, PIXI.LoaderResource>>

async function loadCharacter (app: PIXI.Application, characterName: string, path: string): Promise<PIXI.spine.Spine> {
  const loader = app.loader.add(characterName, path)
  const resources = await new Promise<LoaderReturnType>(resolve => loader.load((_, x) => resolve(x)))
  const characterResources = resources[characterName]
  if (characterResources === undefined) throw new Error('Cannot load character data')
  return new PIXI.spine.Spine(characterResources.spineData)
}

interface lastMemory {
  width: number
  height: number
}

export default async (name: string): Promise<void> => {
  huiDesktop.dragMoveLeft = huiDesktop.dragMoveRight = true
  document.body.style.background = 'rgba(255,255,255,0.7)'

  const app = (() => {
    const lastStr = sessionStorage.getItem('automake')
    if (lastStr !== null) {
      const last = JSON.parse(lastStr) as lastMemory
      huiDesktop.window.width = last.width + 20
      huiDesktop.window.height = last.height + 20 + 20
      return new PIXI.Application({ width: last.width + 20, height: last.height + 20, transparent: true })
    }
    huiDesktop.window.width = 512
    huiDesktop.window.height = 512 + 20
    return new PIXI.Application({ width: 512, height: 512, transparent: true })
  })()
  const info = document.createElement('div')
  document.body.appendChild(info)

  document.body.appendChild(app.view)
  const spine = await loadCharacter(app, name, '/sandbox/' + name + '.skel')
  app.stage.addChild(spine)
  console.info(spine.getBounds())

  const dz = ['stand2', 'walk', 'touch', 'tuozhuai2', 'wash', 'victory']
  let len = 0
  const fixed = { x: 0, y: 0, w: 0, h: 0, t: 0, d: 0 }
  let final = { x: 0, y: 0, w: 0, h: 0 }
  const copy = (): void => {
    final = { x: fixed.x, y: fixed.y, w: fixed.w, h: fixed.h }
  }
  const same = (): boolean => final.x === fixed.x && final.y === fixed.y && final.w === fixed.w && final.h === fixed.h
  const update = (): void => {
    info.innerText = `x: ${final.x}, y: ${final.y}, w: ${final.w}, h: ${final.h}, t: ${fixed.t}/${len}`
    if (final.w > app.view.width || final.h > app.view.height) {
      sessionStorage.setItem('automake', JSON.stringify({ width: final.w + 50, height: final.h + 50 } as lastMemory))
      location.reload()
    }
  }

  dz.forEach(x => { len = Math.max(len, Math.ceil(spine.skeleton.data.findAnimation(x).duration * 1000 / 16)) })
  len *= 2

  spine.state.setAnimation(0, dz[fixed.d], true)

  const stopToken = setInterval(() => {
    const bound = spine.getBounds()
    console.info(bound)
    if (bound.x < 0) fixed.x = Math.ceil(fixed.x - bound.x)
    if (bound.y < 0) fixed.y = Math.ceil(fixed.y - bound.y)
    fixed.w = Math.max(fixed.w, Math.ceil(bound.width + bound.x))
    fixed.h = Math.max(fixed.h, Math.ceil(bound.height + bound.y))
    spine.x = fixed.x
    spine.y = fixed.y

    if (same()) fixed.t += 1
    else { fixed.t = 0; copy() }
    if (fixed.t > len) {
      fixed.t = 0
      fixed.d += 1
      if (dz[fixed.d] === 'victory') {
        clearInterval(stopToken)
        fetch('/config', {
          method: 'POST',
          body: JSON.stringify({
            width: final.w,
            height: final.h,
            x0: final.x,
            y0: final.h - final.y,
            location: `/sandbox/${name}.skel`,
            name
          })
        }).then(() => location.reload()).catch(console.error)
      }
      spine.state.setAnimation(0, dz[fixed.d], true)
    }
    update()
  }, 16)

  ;(window as any).qwqqaq = stopToken
}
