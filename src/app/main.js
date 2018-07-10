const fs = require('fs')
const path = require('path')
const { app, BrowserWindow, ipcMain, session } = require('electron')
const utils = require('./lib/utils')
const ssLocal = require('./lib/shadowsocks/ssLocal')
const ifaces = require('os').networkInterfaces()

const clientOptFile = fs.existsSync(path.join(__dirname, 'config/client.json')) ? './config/client.json' : './config/default.json'
const clientOpt = require(clientOptFile)
const commonOpt = require('./config/common.json')

let homeUrl
if (Array.isArray(clientOpt.homeUrl)) {
    const arrLen = clientOpt.homeUrl.length
    const rdmIdx = Math.floor(Math.random() * arrLen)
    homeUrl = clientOpt.homeUrl[rdmIdx]
} else {
    homeUrl = clientOpt.homeUrl
}

let win
let sslocalServer

const startShadowsocks = (addr, port) => {
    const opt = {
        localAddr: addr,
        localPort: port,
        serverAddr: '221.229.166.226',
        serverPort: 17777,
        password: '0367E21094d36315',
        method: 'aes-256-cfb',
        timeout: 180,
    }
    sslocalServer = ssLocal.startServer(opt, true)
}

const cookieName = 'TripleonetechSafetyBrowserCookie'

ipcMain.on('ssinfo', (event, data) => {
    if (data) startShadowsocks(data.localServer, data.port)
    // save token to session
    const ses = win.webContents.session
    ses.cookies.set({
        url: homeUrl,
        name: cookieName,
        value: data.token,
        expirationDate: Math.ceil(Date.now() / 1000) + 7200,
    }, () => { })
})

let pluginName
let flashVersion
let platform

switch (process.platform) {
case 'win32':
    platform = 'windows'
    switch (process.arch) {
    case 'x64':
        pluginName = 'pepflashplayer64_25_0_0_171.dll'
        flashVersion = '25.0.0.171'
        break
    case 'ia32':
        pluginName = 'pepflashplayer32_25_0_0_171.dll'
        flashVersion = '25.0.0.171'
        break
    default:
        break
    }
    break
case 'darwin':
    platform = 'mac'
    pluginName = 'PepperFlashPlayer.plugin'
    flashVersion = '29.0.0.140'
    break
case 'linux':
    pluginName = 'libpepflashplayer.so'
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
    show: false,
}

const icon = path.join(__dirname, 'config/icon.ico')
if (fs.existsSync(icon)) {
    winOpt.icon = icon
}


function createWindow() {
    win = new BrowserWindow(winOpt)

    utils.autoUpdate(app, platform, clientOpt.client)
    win = new BrowserWindow(winOpt)
    win.on('page-title-updated', (event) => {
        event.preventDefault()
    })

    win.webContents.on('new-window', (event, url) => {
        if (url && (
            url.toLowerCase().includes('onlineservice') ||
            url.toLowerCase().includes('iframe_module/autodeposit3rdparty') ||
            url.toLowerCase().includes('player_center/autodeposit3rdparty')
        )
        ) {
            return
        }

        event.preventDefault()
        const newWin = new BrowserWindow(winOpt)
        newWin.once('ready-to-show', () => newWin.show())
        newWin.loadURL(url)

        newWin.webContents.on('new-window', (newEvent, newUrl) => {
            if (newUrl && (
                newUrl.toLowerCase().startsWith('https://cashier.turnkey88.com/gamehistory.php')
            )) {
                newEvent.preventDefault()
            }
        })

        newWin.webContents.on('-new-window', (newEvent, newUrl, frameName, disposition, additionalFeatures, postData) => {
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
                        loadOptions.extraHeaders = `content-type: multipart/form-data; boundary=${boundary[0].substr(2)}`
                    }
                }
            }
            postWin.loadURL(newUrl, loadOptions)
            newEvent.newGuest = postWin
        })

        event.newGuest = newWin
    })

    win.on('closed', () => {
        win = null
    })

    require('./menu')(commonOpt.version)

    if (clientOpt.enabledProxy) {
        sslocalServer = ssLocal.startServer(clientOpt.proxyOptions, true)

        win.webContents.session.setProxy({ pacScript: `file://${__dirname}/config/default.pac` }, () => {
            win.loadURL(homeUrl)
        })

        session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
            let address
            for (const dev in ifaces) {
                ifaces[dev].filter(d => d.family === 'IPv4' && d.internal === false ? address = d.address : undefined)
            }
            details.requestHeaders['X-SS-CLIENT-ADDR'] = address
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

function downloadFlashplayerDll() {
    const link = `${commonOpt.pluginsDownloadUrl}/flashplayer/${pluginName}`
    const dest = path.resolve(__dirname, '..', 'plugins', pluginName)
    const dlWin = new BrowserWindow({ width: 300, height: 200, frame: false })
    dlWin.loadURL(`file://${path.resolve(__dirname, 'downloading.html')}`)

    utils.download(link, dest, () => {
        createWindow()
        dlWin.close()
    })
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
