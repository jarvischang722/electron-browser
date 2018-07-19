const fs = require('fs')
const path = require('path')
const { app, BrowserWindow, ipcMain, session, dialog } = require('electron')
const utils = require('./lib/utils')
const ssLocal = require('./lib/shadowsocks/ssLocal')
const ifaces = require('os').networkInterfaces()
const util = require('./util/index')
const request = require('request')
const progress = require('request-progress')
const ProgressBar = require('electron-progressbar')

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
        serverAddr: '106.75.166.72',
        serverPort: 19999,
        password: 'nMvTdb7VXMPudFWH',
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
        flashVersion = '25_0_0_171'
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
    if (!fs.existsSync(flashPath)) {
        if (platform === 'mac') pluginName = `${pluginName}.zip`
        downloadFP(pluginName)
        return
    }

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
        // Before start SS server,
        // verify that at least one of these shadowsocks server is available.
        let isSSOk = false
        await util.checkAvailableSS(clientOpt).then((ssProxy) => {
            isSSOk = true
            clientOpt.proxyOptions = Object.assign({}, clientOpt.proxyOptions, ssProxy)
        }).catch((error) => {
            dialog.showMessageBox(win, { type: 'warning', title: 'Security warning', message: error.message })
        })

        sslocalServer = ssLocal.startServer(clientOpt.proxyOptions, true)

        // After start SS Server,
        // verify public ip and client configuration serverAddr is the same.
        if (isSSOk) {
            const pubIP = await util.getPubIPEnableSS(clientOpt)
            if (pubIP !== clientOpt.proxyOptions.serverAddr) {
                dialog.showMessageBox(win, { type: 'warning', title: 'Security warning', message: 'Shadowsocks server is not working. ' })
            }
        }

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

/**
 * Download flashplayer from service.
 */
function downloadFP(fileName) {
    const pluginPath = path.resolve(__dirname, '..', 'plugins')

    if (!fs.existsSync(pluginPath)) {
        fs.mkdirSync(pluginPath)
    }

    const link = `${commonOpt.pluginsDownloadUrl}/flashplayer/${fileName}`
    const dest = path.resolve(__dirname, '..', 'plugins', fileName)
    const progressBar = new ProgressBar({
        indeterminate: false,
        title: `safety-browser-${clientOpt.client}-setup-${commonOpt.version}`,
        text: `Downloading ${fileName}...`,
        browserWindow: {
            height: 250,
        },
        style: {
            detail: {
                'line-height': '20px',
            },
            bar: {
                position: 'relative',
                top: '60px',
            },
        },
    })
    progress(request(link))
        .on('progress', (state) => {
            let speedUnit = 'KB'
            let speed = Math.round(state.speed / 1024)
            if (speed > 1024) {
                speedUnit = 'MB'
                speed = Math.round(speed / 1024)
            }
            const percent = Math.round(state.percent * 100)
            const totalSize = Math.round(state.size.total / 1024)
            const transferredSize = Math.round(state.size.transferred / 1024)
            const remainingTime = Math.round(state.time.remaining)
            const elapsedTime = Math.round(state.time.elapsed)
            progressBar.detail = `Speed:  ${speed} ${speedUnit}/s <br>  
                                  Elapsed time: ${elapsedTime} sec <br> 
                                  Remaining time: ${remainingTime} sec <br> <br>
                                ${transferredSize} KB of ${totalSize} KB (${percent} %)`
            progressBar.value = percent
        })
        .on('end', async () => {
            if (platform === 'mac') {
                const unzipPath = path.resolve(__dirname, '..', 'plugins')
                await util.upzip(dest, unzipPath)
                // Delete this file after one second of decompression
                // and avoid not yet unzipping complete
                setTimeout(() => { fs.unlink(dest) }, 1000)
            }
            createWindow()
            progressBar.close()
        })
        .pipe(fs.createWriteStream(dest))
}
