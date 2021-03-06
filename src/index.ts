/* eslint-disable @typescript-eslint/promise-function-async */
import HuiDesktopAzureLaneApplication from './app'
import autoMake from './autoMake'

const batKey = 'cc.huix.blhx.current'

const bat = (list: string[]): void => {
  const current = (() => {
    const s = sessionStorage.getItem(batKey)
    if (s === null) {
      sessionStorage.setItem(batKey, '1')
      return 1
    } else return parseInt(s)
  })()
  if (list.length < current) {
    const ele = document.createElement('div')
    ele.innerText = 'finished'
    document.body.append(ele)
  } else {
    const name = list[current - 1]
    autoMake(`${name}/files/${name}`).then(settings => {
      sessionStorage.setItem(batKey, (current + 1).toString())
      return fetch(`/sandbox/${name}/config`, { method: 'POST', body: JSON.stringify(settings) })
    }).then(() => location.reload()).catch(err => console.error(err))
  }
}

fetch('https://huidesktop/config')
  .then(response => response.text())
  .then(param => {
    if (param.startsWith('[')) bat(JSON.parse(param))
    else if (!param.includes('{')) {
      autoMake(param)
        .then(settings => fetch('/config', { method: 'POST', body: JSON.stringify(settings) }))
        .then(() => location.reload())
        .catch(console.error)
    } else HuiDesktopAzureLaneApplication.CreateSingleCharacterApp(JSON.parse(param)).then(app => app.run()).catch(console.error)
  })
  .catch(console.error)
