const i18n = new (require('../lib/i18n'))

module.exports = {
    showInspectElement: false,
    prepend: () => [
        {
            label: i18n.__('Go back'),
            click: function (menuItem, browserWindow) {
                browserWindow.webContents.goBack()
            }
        }, {
            label: i18n.__('Forward'),
            click: function (menuItem, browserWindow) {
                browserWindow.webContents.goForward()
            }
        }, {
            label: i18n.__('Reload'),
            role: 'reload'
        }, {
            label: i18n.__('Clean And Reload'),
            role: 'forcereload'
        }, {
            type: 'separator'
        }, {
            label: i18n.__('Select all'),
            role: 'selectall'
        }, {
            label: i18n.__('Copy'),
            role: 'copy'
        }, {
            label: i18n.__('Cut'),
            role: 'cut'
        }, {
            label: i18n.__('Paste'),
            role: 'paste'
        }
    ]
}