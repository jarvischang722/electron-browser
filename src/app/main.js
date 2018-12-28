const fs = require('fs')
const path = require('path')
const { app, BrowserWindow, session } = require('electron')
const { Ss: SsUtils, Browser, AutoUpdater, Flash } = require('./main-process/')
const Utils = require('./lib/utils')

const clientOptFile = path.join(__dirname, 'config', 'client.json')
const clientOpt = require(clientOptFile)
const commonOpt = require('./config/common.json')


let homeUrl = []
let win
let sslocalServer

const platform = Browser.getUsePlatform()
const debug = process.argv.indexOf('--debug') > -1


require('./logger').initLogger(app)
require('./menu')(commonOpt.version)

 // Enable flash plugin for app
Flash.enableFlashPlugin(app, clientOpt)


const winOpt = {
    width: 1024,
    height: 768,
    title: clientOpt.productName,
    webPreferences: {
        webSecurity: false,
        allowRunningInsecureContent: true,
        plugins: true,
    },
    icon: fs.existsSync(path.join(__dirname, 'config', 'icon.ico')) ? path.join(__dirname, 'config', 'icon.ico') : null,
}

async function createWindow() {
    // Check the safetybrowser whether need update.
    AutoUpdater.checkUpdatesAndNotify(app, platform, clientOpt.client)

    Flash.checkExistFlashPlugin(clientOpt)
    // if (!fs.existsSync(flashPath)) {
    //     if (platform === 'mac') pluginName = `${pluginName}.zip`
    //     await downloadFP(pluginName, clientOpt, platform)
    // }

    // Rewrite Pac File
    homeUrl = await Browser.getHomeurl(clientOpt)
    Browser.writePacFile(clientOpt, homeUrl)

    win = new BrowserWindow(winOpt)

    // Check if open SS proxy
    const enabledProxy = SsUtils.checkEnabledSSProxy(homeUrl)
    if (enabledProxy) {
        sslocalServer = await SsUtils.startShadowSocksServer(clientOpt)
        win.webContents.session.setProxy(
            { pacScript: `file://${__dirname}/config/default.pac` },
            () => {
                win.loadURL(homeUrl)
            },
        )
        session.defaultSession.webRequest.onBeforeSendHeaders(async (details, callback) => {
            details.requestHeaders['User-Agent'] = `${details.headers['User-Agent']} t1t_safetybrowser/${commonOpt.version}`
            details.requestHeaders['X-SS-CLIENT-ADDR'] = await Utils.getPubIP(clientOpt, typeof sslocalServer === 'object')
            details.requestHeaders['X-SS-PC'] = '1'
            callback({
                cancel: false,
                requestHeaders: details.requestHeaders,
            })
        })
    } else {
        win.loadURL(homeUrl)
    }


    // It was trigger that when win open new windows
    win.webContents.on('new-window', (event, url) => {
        if (
            url &&
            (url.toLowerCase().includes('onlineservice') ||
                url.toLowerCase().includes('iframe_module/autodeposit3rdparty') ||
                url.toLowerCase().includes('player_center/autodeposit3rdparty'))
        ) {
            return
        }

        event.preventDefault()
        const newWin = new BrowserWindow(winOpt)
        newWin.once('ready-to-show', () => newWin.show())
        newWin.loadURL(url)

        newWin.webContents.on('new-window', (newEvent, newUrl) => {
            if (
                newUrl &&
                newUrl.toLowerCase().startsWith('https://cashier.turnkey88.com/gamehistory.php')
            ) {
                newEvent.preventDefault()
            }
        })
        event.newGuest = newWin
    })

    win.on('page-title-updated', (event) => {
        event.preventDefault()
    })

    win.on('closed', () => {
        win = null
    })

    if (debug) {
        win.openDevTools()
        require('devtron').install()  // inspect, monitor, and debug our Electron app
    }

    win.maximize()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

app.on('quit', () => {
    // close all
    if (sslocalServer) {
        sslocalServer.closeAll()
    }
})
