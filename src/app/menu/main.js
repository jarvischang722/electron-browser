const i18n = new (require('../lib/i18n'))

const menuTemplate = [
    {
        label: i18n.__('Edit'),
        submenu: [
            {
                label: i18n.__('Undo'),
                role: 'undo'
            }, {
                label: i18n.__('Redo'),
                role: 'redo'
            }, {
                type: 'separator'
            }, {
                label: i18n.__('Cut'),
                role: 'cut'
            }, {
                label: i18n.__('Copy'),
                role: 'copy'
            }, {
                label: i18n.__('Paste'),
                role: 'paste'
            }, {
                label: i18n.__('Delete'),
                role: 'delete'
            }, {
                label: i18n.__('Select all'),
                role: 'selectall'
            }
        ]
    }, {
        label: i18n.__('View'),
        submenu: [
            {
                label: i18n.__('Go back'),
                click: (menuItem, win) => {
                    win.webContents.goBack()
                }
            }, {
                label: i18n.__('Forward'),
                click: (menuItem, win) => {
                    win.webContents.goForward()
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
                label: i18n.__('Reset Zoom'),
                role: 'resetzoom'
            }, {
                label: i18n.__('Zoom in'),
                role: 'zoomin'
            }, {
                label: i18n.__('Zoom out'),
                role: 'zoomout'
            }, {
                type: 'separator'
            }, {
                label: i18n.__('Toggle fullscreen'),
                role: 'togglefullscreen'
            }
        ]
    }
]

if (process.platform === 'darwin') {
    menuTemplate.unshift({
        label: i18n.__('AppName'),
        submenu: [{
            label: i18n.__('Quit'),
            role: 'quit'
        }]
    })
    // Edit menu.
    // menuTemplate[1].submenu.push({
    //         type: 'separator'
    //     }, {
    //         label: 'Speech',
    //         submenu: [{
    //                 role: 'startspeaking'
    //             },
    //             {
    //                 role: 'stopspeaking'
    //             }
    //         ]
    //     })
    // Window menu.
    // menuTemplate[3].submenu = [{
    //         label: 'Close',
    //         accelerator: 'CmdOrCtrl+W',
    //         role: 'close'
    //     },
    //     {
    //         label: 'Minimize',
    //         accelerator: 'CmdOrCtrl+M',
    //         role: 'minimize'
    //     },
    //     {
    //         label: 'Zoom',
    //         role: 'zoom'
    //     },
    //     {
    //         type: 'separator'
    //     },
    //     {
    //         label: 'Bring All to Front',
    //         role: 'front'
    //     }
    // ]
}

module.exports = menuTemplate