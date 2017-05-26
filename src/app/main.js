const fs = require('fs')
const path = require("path")
const { app, BrowserWindow, ipcMain } = require('electron')
const utils = require('./lib/utils')
const ssLocal = require('shadowsocks-js/lib/ssLocal')
const clientOptFile = fs.existsSync(path.join(__dirname, 'config/client.json')) ? './config/client.json' : './config/default.json'
const clientOpt = require(clientOptFile)
let homeUrl
if (Array.isArray(clientOpt.homeUrl)) {
    const arrLen = clientOpt.homeUrl.length
    const rdmIdx = Math.floor(Math.random() * arrLen)
    homeUrl = clientOpt.homeUrl[rdmIdx]
} else {
    homeUrl = clientOpt.homeUrl
}

let sslocalServer

const startShadowsocks = (addr, port) => {
    const opt = {
        localAddr: addr,
        localPort: port,
        serverAddr: "119.9.91.119",
        serverPort: 19999,
        password: "0367E21094d36315",
        method: "aes-256-cfb",
        timeout: 180
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
    }, () => {})
})

let pluginName
let flashVersion
let platform

switch (process.platform) {
    case 'win32':
        platform = 'windows'
        switch (process.arch) {
            case 'x64':
                pluginName='pepflashplayer64_25_0_0_171.dll'
                flashVersion = '25.0.0.171'
                break
            case 'ia32':
                pluginName='pepflashplayer32_25_0_0_171.dll'
                flashVersion = '25.0.0.171'
                break
        }
        break
    case 'darwin':
        platform = 'mac'
        pluginName = 'PepperFlashPlayer.plugin'
        break
    case 'linux':
        pluginName = 'libpepflashplayer.so'
        break
}
let flashPath = path.join(__dirname, '../plugins', pluginName)

if (clientOpt.enabledFlash) {
    app.commandLine.appendSwitch('ppapi-flash-path', flashPath)
    app.commandLine.appendSwitch('ppapi-flash-version', flashVersion)
}

let win

const winOpt = {
    width: 1024,
    height: 768,
    title: clientOpt.productName,
    webPreferences: {
        nodeIntegration: false,
        webSecurity: false,
        allowRunningInsecureContent: true,
        plugins: true,
    }
}

const icon = path.join(__dirname, 'config/icon.ico')
if (fs.existsSync(icon)) {
    winOpt.icon = icon
}

function createWindow() {
    utils.autoUpdate(app, platform, clientOpt.client, clientOpt.version)
    win = new BrowserWindow(winOpt)
    win.on('page-title-updated', (event) => {
        event.preventDefault()
    })

    win.webContents.on('new-window', function(event, url) {
        event.preventDefault()
        const newWin = new BrowserWindow(winOpt)
        newWin.once('ready-to-show', () => newWin.show())
        newWin.loadURL(url)

        newWin.webContents.on('new-window', function(event, url) {
            if (url && (
                url.toLowerCase().startsWith('https://cashier.turnkey88.com/gamehistory.php')
            )) {
                event.preventDefault()
            }
        })

        newWin.webContents.on('-new-window', function(event, url, frameName, disposition, additionalFeatures, postData) {
            event.preventDefault()
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
            postWin.loadURL(url, loadOptions)
            event.newGuest = postWin
        })

        event.newGuest = newWin
    })

    win.on('closed', () => {
        win = null
    })

    require('./menu')

    if (clientOpt.enabledProxy) {
        win.webContents.session.setProxy({ pacScript: `file://${__dirname}/config/default.pac` }, function () {
            win.loadURL(homeUrl)
        })
    } else {
        win.loadURL(homeUrl)
    }

    win.maximize()
}

function createWindow2() {
    win = new BrowserWindow(winOpt)
    win.on('page-title-updated', (event) => {
        event.preventDefault()
    })
    const webContents = win.webContents
    webContents.on('did-finish-load', () => {
        webContents.send('home-url', homeUrl)
    })

	// cookieAuth(win, function() {
	// 	webContents.send('cookie-auth-complete')
	// })

    // get token from session
    const ses = win.webContents.session
    ses.cookies.get({
        url: homeUrl,
        name: cookieName,
    }, (err, cookies) => {
        if (err || !cookies || cookies.length <= 0) {
            win.loadURL(`file://${__dirname}/views/login.html`)
        } else {
            // 接入真实环境之后, 可以使用下面链接进入主页
            // win.loadURL(`http://player.demo.tripleonetech.com/iframe/auth/login_with_token/${cookies[0].value}?next=${homeUrl}`)
            win.loadURL(homeUrl)
        }
    })

    win.show()
    win.maximize()
	win.on('closed', function() {
		win = null
	})
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

app.on('quit', () => {
    //close all
    if (sslocalServer) {
        sslocalServer.closeAll()
    }
})
