const path = require("path")
const { app, BrowserWindow, ipcMain } = require('electron')
const { enabled_flash, enabled_proxy, proxyOptions, homeUrl } = require('./lib/client.json')
// const cookieAuth = require('./lib/cookie-auth')

const ssLocal = require('./lib/ssLocal')

let sslocalServer
ipcMain.on('ssinfo', (event, data) => {
    const opt = {
        localAddr: data.localServer,
        localPort: data.port,
        serverAddr: "119.9.91.119",
        serverPort: 19999,
        password: "0367E21094d36315",
        method: "aes-256-cfb",
        timeout: 180
    }
    sslocalServer = ssLocal.startServer(opt, true)
})

let pluginName
let flashVersion

switch (process.platform) {
    case 'win32':
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
            show: false,
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
    const Config = {

    }
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

	// webContents.session.webRequest.onBeforeRequest(function(details, callback) {
	// 	if (details.resourceType === 'script' && details.url.startsWith('http://') && ! details.url.startsWith(Config.server_url + ':' + Config.server_port + '/')) {
	// 		callback({ redirectURL: details.url.replace('http', 'https') })
	// 	} else {
	// 		callback({})
	// 	}
	// })
    win.loadURL(`file://${__dirname}/index.html`)
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
