const { Menu, app } = require('electron')

var i18n = new (require('./lang/i18n'))

// console.log(app.getLocale())

require('electron-context-menu')({
    showInspectElement: false,
    prepend: (params, browserWindow) => [{
        label: i18n.__('Go back'),
        click: function (menuItem, browserWindow, event) {
            browserWindow.webContents.goBack();
        }
    }, {
        label: i18n.__('Forward'),
        click: function (menuItem, browserWindow, event) {
            browserWindow.webContents.goForward();
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
    }]
});

const menuTemplate = [{
    label: i18n.__('Edit'),
    submenu: [{
        label: i18n.__('Undo'),
        role: 'undo'
    },
    {
        label: i18n.__('Redo'),
        role: 'redo'
    },
    {
        type: 'separator'
    },
    {
        label: i18n.__('Cut'),
        role: 'cut'
    },
    {
        label: i18n.__('Copy'),
        role: 'copy'
    },
    {
        label: i18n.__('Paste'),
        role: 'paste'
    },
    {
        label: i18n.__('Delete'),
        role: 'delete'
    },
    {
        label: i18n.__('Select all'),
        role: 'selectall'
    }
    ]
},
{
    label: i18n.__('View'),
    submenu: [{
        label: i18n.__('Go back'),
        click: function (menuItem, browserWindow, event) {
            browserWindow.webContents.goBack();
        }
    }, {
        label: i18n.__('Forward'),
        click: function (menuItem, browserWindow, event) {
            browserWindow.webContents.goForward();
        }
    }, {
        label: i18n.__('Reload'),
        role: 'reload'
    },
    {
        label: i18n.__('Clean And Reload'),
        role: 'forcereload'
    },
    {
        type: 'separator'
    },
    {
        label: i18n.__('Reset Zoom'),
        role: 'resetzoom'
    },
    {
        label: i18n.__('Zoom in'),
        role: 'zoomin'
    },
    {
        label: i18n.__('Zoom out'),
        role: 'zoomout'
    },
    {
        type: 'separator'
    },
    {
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


const menu = Menu.buildFromTemplate(menuTemplate)
// console.log(menu);
Menu.setApplicationMenu(menu)