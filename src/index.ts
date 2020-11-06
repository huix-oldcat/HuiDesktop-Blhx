import HuiDesktopAzureLaneApplication from "./app"

HuiDesktopAzureLaneApplication.CreateSingleCharacterApp(window.location.hash.substr(1))
  .then(app => app.run())
