const fs = require('fs')
const path = require('path')
const { app, BrowserWindow, session, dialog } = require('electron')
const { Ss: SsUtils, Browser, AutoUpdater } = require('./main-process/')
const Utils = require('./lib/utils')
const ssLocal = require('./lib/shadowsocks/ssLocal')

const clientOptFile = path.join(__dirname, 'config', 'client.json')
const clientOpt = require(clientOptFile)
const commonOpt = require('./config/common.json')

let homeUrl = []
let win
let sslocalServer
let pluginName
let flashVersion
let platform
const debug = process.argv.indexOf('--debug') > -1


require('./logger').initLogger(app)


switch (process.platform) {
case 'win32':
    platform = 'windows'
    if (process.arch === 'x64') {
        pluginName = 'pepflashplayer64_25_0_0_171.dll'
        flashVersion = '25.0.0.171'
    } else {
        pluginName = 'pepflashplayer32_25_0_0_171.dll'
        flashVersion = '25.0.0.171'
    }
    break
case 'darwin':
    platform = 'mac'
    pluginName = 'PepperFlashPlayer.plugin'
    flashVersion = '29.0.0.140'
    break
case 'linux':
    platform = 'linux'
    flashVersion = '25.0.0.171'
    if (process.arch === 'x64') {
        pluginName = 'libpepflashplayer64_25_0_0_171.so'
    } else {
        pluginName = 'libpepflashplayer32_25_0_0_171.so'
    }
    break
default:
    break
}

const flashPath = path.join(__dirname, '..', 'plugins', pluginName)

if (clientOpt.enabledFlash) {
    app.commandLine.appendSwitch('ppapi-flash-path', flashPath)
    app.commandLine.appendSwitch('ppapi-flash-version', flashVersion)
}

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
    homeUrl = await Browser.getHomeurl(clientOpt)
    Browser.writePacFile(clientOpt, homeUrl)

    if (!fs.existsSync(flashPath)) {
        if (platform === 'mac') pluginName = `${pluginName}.zip`
        await Browser.downloadFP(pluginName, clientOpt, platform)
    }

    AutoUpdater.checkUpdatesAndNotify(app, platform, clientOpt.client)

    win = new BrowserWindow(winOpt)

    win.on('page-title-updated', (event) => {
        event.preventDefault()
    })

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

    win.on('closed', () => {
        win = null
    })

    require('./menu')(commonOpt.version)

    const enabledProxy = SsUtils.checkEnabledSSProxy(homeUrl)
    if (enabledProxy) {
        // Before start SS server,
        // verify that at least one of these shadowsocks server is available.
        let isSSOk = false
        const ssProxy = await SsUtils.checkAvailableSS(clientOpt)
        if (ssProxy.error) {
            dialog.showMessageBox(win, {
                type: 'warning',
                title: 'Security warning',
                message: ssProxy.error.message,
            })
        } else {
            isSSOk = true
            clientOpt.proxyOptions = Object.assign({}, clientOpt.proxyOptions, ssProxy)
        }

        // After start SS Server,
        // verify public ip and client configuration serverAddr is the same.
        let pubIP = ''
        if (isSSOk) {
            sslocalServer = ssLocal.startServer(clientOpt.proxyOptions, true)
            pubIP = await Utils.getPubIP(clientOpt, true) // The line must be placed after server started.
            if (pubIP !== clientOpt.proxyOptions.serverAddr) {
                dialog.showMessageBox(win, {
                    type: 'warning',
                    title: 'Security warning',
                    message: 'Shadowsocks server is not working. ',
                })
            }
        }

        win.webContents.session.setProxy(
            { pacScript: `file://${__dirname}/config/default.pac` },
            () => {
                win.loadURL(homeUrl)
            },
        )
        session.defaultSession.webRequest.onBeforeSendHeaders(async (details, callback) => {
            pubIP = await Utils.getPubIP(clientOpt, isSSOk)
            details.requestHeaders['User-Agent'] = `${details.headers['User-Agent']} t1t_safetybrowser/${commonOpt.version}`
            details.requestHeaders['X-SS-CLIENT-ADDR'] = pubIP
            details.requestHeaders['X-SS-PC'] = '1'
            callback({
                cancel: false,
                requestHeaders: details.requestHeaders,
            })
        })
    } else {
        win.loadURL(homeUrl)
    }

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
