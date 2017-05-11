const path = require("path")
const { app, BrowserWindow, ipcMain } = require('electron')
const { enabled_flash, enabled_proxy, proxyOptions, homeUrl } = require('./lib/client.json')
const cookieAuth = require('./lib/cookie-auth')

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
switch (process.platform) {
    case 'win32':
        pluginName = 'pepflashplayer32_24_0_0_221.dll'
        break
    case 'darwin':
        pluginName = 'PepperFlashPlayer.plugin'
        break
    case 'linux':
        pluginName = 'libpepflashplayer.so'
        break
}
let flash_path = path.join(__dirname, pluginName)

if (enabled_flash) {
    app.commandLine.appendSwitch('ppapi-flash-path', flash_path)
    app.commandLine.appendSwitch('ppapi-flash-version', '24.0.0.221')
}

let win

function createWindow() {
    win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            webSecurity: false,
            allowRunningInsecureContent: false,
            plugins: true
        }
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
        webPreferences: {
            webSecurity: false,
            allowRunningInsecureContent: false,
            plugins: true
        }
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
