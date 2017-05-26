const { Menu } = require('electron')
const contextMenu = require('electron-context-menu')

const context = require('./context')
const mainMenu = require('./main')

contextMenu(context)
Menu.setApplicationMenu(Menu.buildFromTemplate(mainMenu))