const fs = require('fs')
const path = require('path')
const { app, BrowserWindow, ipcMain, session, Menu } = require('electron')
const utils = require('./lib/utils')
const ssLocal = require('./lib/shadowsocks/ssLocal')
const ifaces = require('os').networkInterfaces()
const launcher = require('browser-launcher2')
const request = require('request')
const whitelist = require('./config/whitelist.json')

const clientOptFile = fs.existsSync(path.join(__dirname, 'config/client.json')) ? './config/client.json' : './config/default.json'
const clientOpt = require(clientOptFile)
const commonOpt = require('./config/common.json')

const visibleUrlPath = path.join(__dirname, 'visible-url.html')
const noUrlPath = path.join(__dirname, 'no-url.html')

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
let showUrl = false

global.homeUrl = homeUrl
global.isNewWindow = false
global.whitelist = whitelist
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

function showAddressBar() {
    if (showUrl === false) {
        showUrl = true
        global.isNewWindow = false
        win.loadURL(visibleUrlPath)
        return showUrl
    } else {
        showUrl = false
        global.isNewWindow = false
        win.loadURL(noUrlPath)
        return showUrl
    }
}

function ieLauncher(url) {
    launcher((err, launch) => {
        if (err) {
            return err
        }
        launch(url, 'ie', (e, instance) => {
            if (e) {
                return e
            }
            instance.on('stop', () => {
            })
        })
    })
}

function whitelistChecker(url) {
    let isWhiteList = false
    for (let i = 0; i < whitelist.links.length; i++) {
        if (whitelist.links[i].match(url)) {
            isWhiteList = true
            break
        }
    }

    return isWhiteList
}
require('./menu')(commonOpt.version)

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

ipcMain.on('set-current-url', (event, url) => {
    homeUrl = url
    global.homeUrl = homeUrl
})

const winOpt = {
    width: 1024,
    height: 768,
    title: clientOpt.productName,
    webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
        plugins: true,
    },
}

const icon = path.join(__dirname, 'config/icon.ico')
if (fs.existsSync(icon)) {
    winOpt.icon = icon
}

const menu = Menu.getApplicationMenu()
const count = menu.items[1].submenu.items.length

function createWindow() {
    utils.autoUpdate(app, platform, clientOpt.client)
    win = new BrowserWindow(winOpt)

    menu.items[1].submenu.items[0].click = () => {
        win.webContents.send('go-back-menu')
    }

    menu.items[1].submenu.items[1].click = () => {
        win.webContents.send('go-forward-menu')
    }

    menu.items[1].submenu.items[2].click = () => {
        win.webContents.send('reload-menu')
    }

    menu.items[1].submenu.items[3].click = () => {
        win.webContents.send('force-reload-menu')
    }

    menu.items[1].submenu.items[count - 1].click = () => {
        showAddressBar()
        menu.items[1].submenu.items[count - 1].checked = showUrl
    }

    win.on('page-title-updated', (event) => {
        event.preventDefault()
    })

    win.webContents.on('will-navigate', (event, url) => {
        if (url.includes('deposit/auto_payment') || url.includes('player_center/auto_payment')) {
            event.preventDefault()
            session.defaultSession.cookies.get({ url }, (error, cookies) => {
                let validCookie
                let hasValidCookie = false
                if (cookies.length > 0) {
                    for (const i in cookies) {
                        if (cookies[i].name.includes('sess_og_player')) {
                            hasValidCookie = true
                            validCookie = `${cookies[i].name}=${cookies[i].value}`
                            break
                        }
                    }
                }

                if (hasValidCookie) {
                    const cookie = request.cookie(validCookie)
                    const j = request.jar()
                    j.setCookie(cookie, `${clientOpt.homeUrl}pub/get_player_token`, (err, val) => { if (err) return err })

                    request({ method: 'GET', url: `${clientOpt.homeUrl}pub/get_player_token`, json: false, jar: j }, (err, res, body) => {
                        if (err) return err

                        const authUrl = `${clientOpt.homeUrl}iframe/auth/login_with_token/${body}?next=${url}`
                        ieLauncher(authUrl)
                    })
                } else {
                    ieLauncher(url)
                }
            })
        }
    })

    win.webContents.on('will-attach-webview', (event, webPreferences, params) => {
        params.src = homeUrl
    })

    win.webContents.on('new-window', (event, url) => {
        if (url && (
            url.toLowerCase().includes('onlineservice') ||
            url.toLowerCase().includes('iframe_module/autodeposit3rdparty')
            )
        ) {
            return
        }

        event.preventDefault()

        if (whitelistChecker(url)) {
            ieLauncher(url)
        } else {
            global.newWinUrl = url
            global.isNewWindow = true
            menu.items[1].submenu.items[count - 1].enabled = false
            const newWin = new BrowserWindow(winOpt)
            newWin.once('ready-to-show', () => newWin.show())
            if (!showUrl) {
                newWin.loadURL(noUrlPath)
            } else {
                newWin.loadURL(visibleUrlPath)
            }
            // newWin.openDevTools()

            newWin.webContents.on('new-window', (newEvent, newUrl) => {
                newEvent.preventDefault()
                // if (newUrl && (
                //     newUrl.toLowerCase().startsWith('https://cashier.turnkey88.com/gamehistory.php')
                // )) {
                //     newEvent.preventDefault()
                // }
                if (whitelistChecker(newUrl)) {
                    ieLauncher(newUrl)
                } else {
                    if (!showUrl) {
                        newWin.loadURL(noUrlPath)
                    } else {
                        newWin.loadURL(visibleUrlPath)
                    }
                    event.newGuest = newWin
                }
            })

            newWin.on('closed', () => {
                const allWindows = BrowserWindow.getAllWindows()
                const n = allWindows.length
                if (n < 2) {
                    menu.items[1].submenu.items[count - 1].enabled = true
                }
            })
            // newWin.webContents.on('-new-window', (newEvent, newUrl, frameName, disposition, additionalFeatures, postData) => {
            //     newEvent.preventDefault()
            //     const postWin = new BrowserWindow(winOpt)
            //     postWin.once('ready-to-show', () => postWin.show())
            //     const loadOptions = {}
            //     if (postData != null) {
            //         loadOptions.postData = postData
            //         loadOptions.extraHeaders = 'content-type: application/x-www-form-urlencoded'
            //         if (postData.length > 0) {
            //             const postDataFront = postData[0].bytes.toString()
            //             const boundary = /^--.*[^-\r\n]/.exec(postDataFront)
            //             if (boundary != null) {
            //                 loadOptions.extraHeaders = `content-type: multipart/form-data; boundary=${boundary[0].substr(2)}`
            //             }
            //         }
            //     }
            //     postWin.loadURL(newUrl, loadOptions)
            //     newEvent.newGuest = postWin
            // })
            event.newGuest = newWin
        }
    })

    win.on('closed', () => {
        win = null
    })

    if (clientOpt.enabledProxy) {
        sslocalServer = ssLocal.startServer(clientOpt.proxyOptions, true)

        win.webContents.session.setProxy({ pacScript: `file://${__dirname}/config/default.pac` }, () => {
            win.loadURL(homeUrl)
        })

        session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
            let address
            for (const dev in ifaces) {
                ifaces[dev].filter((d) => d.family === 'IPv4' && d.internal === false ? address = d.address : undefined)
            }
            details.requestHeaders['X-SS-CLIENT-ADDR'] = address
            details.requestHeaders['X-SS-PC'] = '1'
            callback({
                cancel: false,
                requestHeaders: details.requestHeaders,
            })
        })
    } else {
        // win.loadURL(homeUrl)
        win.loadURL(noUrlPath)
        // win.loadURL(indexPath)
    }

    win.maximize()
    // win.openDevTools()
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
    win.on('closed', () => {
        win = null
    })
}

app.on('ready', createWindow)

app.on('web-contents-created', (event, contents) => {
    if (contents.getType() === 'webview') {
        contents.on('will-navigate', (e, url) => {
            if (url.includes('deposit/auto_payment') || url.includes('player_center/auto_payment')) {
                e.preventDefault()
                session.defaultSession.cookies.get({ url }, (error, cookies) => {
                    let validCookie
                    let hasValidCookie = false
                    if (cookies.length > 0) {
                        for (const i in cookies) {
                            if (cookies[i].name.includes('sess_og_player')) {
                                hasValidCookie = true
                                validCookie = `${cookies[i].name}=${cookies[i].value}`
                                break
                            }
                        }
                    }

                    if (hasValidCookie) {
                        const cookie = request.cookie(validCookie)
                        const j = request.jar()
                        j.setCookie(cookie, `${clientOpt.homeUrl}pub/get_player_token`, (err, val) => { if (err) return err })

                        request({ method: 'GET', url: `${clientOpt.homeUrl}pub/get_player_token`, json: false, jar: j }, (err, res, body) => {
                            if (err) return err

                            const authUrl = `${clientOpt.homeUrl}iframe/auth/login_with_token/${body}?next=${url}`
                            ieLauncher(authUrl)
                        })
                    } else {
                        ieLauncher(url)
                    }
                })
            } else {
                homeUrl = url
                global.homeUrl = homeUrl
            }
        })
    }
})

app.on('window-all-closed', () => {
    app.quit()
})

app.on('quit', () => {
    // close all
    if (sslocalServer) {
        sslocalServer.closeAll()
    }
})
