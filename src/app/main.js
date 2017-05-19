const path = require("path")
const { app, BrowserWindow, ipcMain } = require('electron')
const { enabled_flash, enabled_proxy, homeUrl } = require('./client.json')
const utils = require('./lib/utils')
const ssLocal = require('./node_modules/shadowsocks-js/lib/ssLocal')

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

if (enabled_flash) {
    app.commandLine.appendSwitch('ppapi-flash-path', flashPath)
    app.commandLine.appendSwitch('ppapi-flash-version', flashVersion)
}

let win

function createWindow() {
    // utils.autoUpdate(app, platform)
    win = new BrowserWindow({
        width: 1024,
        height: 768,
        title: app.getName(),
        webPreferences: {
            nodeIntegration: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
            plugins: true
        }
    })

    win.on('page-title-updated', (event) => {
        event.preventDefault()
    })

    win.webContents.on('new-window', function(event, url) {
        event.preventDefault()
        const win = new BrowserWindow({
            webPreferences: {
                nodeIntegration: false,
                webSecurity: false,
                allowRunningInsecureContent: true,
                plugins: true
            }
        })
        win.once('ready-to-show', () => win.show())
        win.loadURL(url)
        event.newGuest = win
    })

    win.on('closed', () => {
        win = null
    })

    require('./mainmenu')

    if (enabled_proxy) {
        win.webContents.session.setProxy({ pacScript: `file://${__dirname}/default.pac` }, function () {
            win.loadURL(homeUrl)
        })
    } else {
        win.loadURL(homeUrl)
    }

    win.maximize()
}

function createWindow2() {
    win = new BrowserWindow({
        width: 1024,
        height: 768,
        title: app.getName(),
        webPreferences: {
            webSecurity: false,
            allowRunningInsecureContent: false,
            plugins: true
        }
    })
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
            win.loadURL(`file://${__dirname}/login.html`)
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
