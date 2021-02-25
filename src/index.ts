/* eslint-disable @typescript-eslint/promise-function-async */
import HuiDesktopAzureLaneApplication from './app'
import autoMake from './autoMake'

fetch('https://huidesktop/config')
  .then(response => response.text())
  .then(param => {
    if (!param.includes('{')) autoMake(param).catch(console.error)
    else HuiDesktopAzureLaneApplication.CreateSingleCharacterApp(JSON.parse(param)).then(app => app.run()).catch(console.error)
  })
  .catch(console.error)
