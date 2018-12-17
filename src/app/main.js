const fs = require('fs')
const path = require('path')
const { app, BrowserWindow, ipcMain, session, dialog } = require('electron')
const Utils = require('./lib/utils')
const SsUtils = require('./schema/ss')
const Browser = require('./schema/browser')
const ssLocal = require('./lib/shadowsocks/ssLocal')

const clientOptFile = fs.existsSync(path.join(__dirname, 'config/client.json'))
    ? './config/client.json'
    : './config/default.json'
const clientOpt = require(clientOptFile)
const commonOpt = require('./config/common.json')

let homeUrl = []
let win
let sslocalServer
let pluginName
let flashVersion
let platform
const cookieName = 'TripleonetechSafetyBrowserCookie'

const startShadowsocks = (addr, port) => {
    const opt = {
        localAddr: addr,
        localPort: port,
        serverAddr: '106.75.166.72',
        serverPort: 19999,
        password: 'nMvTdb7VXMPudFWH',
        method: 'aes-256-cfb',
        timeout: 180,
    }
    sslocalServer = ssLocal.startServer(opt, true)
}

ipcMain.on('ssinfo', (event, data) => {
    if (data) startShadowsocks(data.localServer, data.port)
    // save token to session
    const ses = win.webContents.session
    ses.cookies.set(
        {
            url: homeUrl,
            name: cookieName,
            value: data.token,
            expirationDate: Math.ceil(Date.now() / 1000) + 7200,
        },
        () => {},
    )
})

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

const flashPath = path.join(__dirname, '../plugins', pluginName)

if (clientOpt.enabledFlash) {
    app.commandLine.appendSwitch('ppapi-flash-path', flashPath)
    app.commandLine.appendSwitch('ppapi-flash-version', flashVersion)
}

const winOpt = {
    width: 1024,
    height: 768,
    title: clientOpt.productName,
    webPreferences: {
        nodeIntegration: false,
        webSecurity: false,
        allowRunningInsecureContent: true,
        plugins: true,
    },
}

const icon = path.join(__dirname, 'config/icon.ico')
if (fs.existsSync(icon)) {
    winOpt.icon = icon
}

async function createWindow() {
    homeUrl = await Browser.getHomeurl(clientOpt)
    Browser.writePacFile(clientOpt, homeUrl)

    if (!fs.existsSync(flashPath)) {
        if (platform === 'mac') pluginName = `${pluginName}.zip`
        await Browser.downloadFP(pluginName, clientOpt, platform)
    }

    Utils.autoUpdate(app, platform, clientOpt.client)
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

        newWin.webContents.on(
            '-new-window',
            (newEvent, newUrl, frameName, disposition, additionalFeatures, postData) => {
                newEvent.preventDefault()
                const postWin = new BrowserWindow(winOpt)
                postWin.once('ready-to-show', () => postWin.show())
                const loadOptions = {}
                if (postData != null) {
                    loadOptions.postData = postData
                    loadOptions.extraHeaders = 'content-type: application/x-www-form-urlencoded'
                    if (postData.length > 0) {
                        const postDataFront = postData[0].bytes.toString()
                        const boundary = /^--.*[^-\r\n]/.exec(postDataFront)
                        if (boundary != null) {
                            loadOptions.extraHeaders = `content-type: multipart/form-data; boundary=${boundary[0].substr(
                                2,
                            )}`
                        }
                    }
                }
                postWin.loadURL(newUrl, loadOptions)
                newEvent.newGuest = postWin
            },
        )

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

    win.maximize()
    // win.openDevTools()
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
