const { Menu } = require('electron')
const contextMenu = require('electron-context-menu')

const context = require('./context')
const getMainMenu = require('./main')

module.exports = (version) => {
    contextMenu(context)
    const template = getMainMenu(version)
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}