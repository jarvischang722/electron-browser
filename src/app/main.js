const fs = require('fs')
const path = require('path')
const { app, BrowserWindow, session, dialog } = require('electron')
const settings = require('electron-settings')
const { Ss: SsUtils, Browser, AutoUpdater, Flash } = require('./main-process/')
const Utils = require('./lib/utils')

let clientOpt = {}
const pjson = require('./package.json')

let homeUrl = []
let win
let loadingWin
let sslocalServer

const debug = process.argv.indexOf('--debug') > -1

function loadModule() {
    require('./logger').initLogger(app)
    require('./menu')()
}

function getClientOpt() {
    return new Promise(async (resolve, reject) => {
        try {
            const clientOptFile = path.join(__dirname, 'config', 'client.json')
            clientOpt = require(clientOptFile)
            const dynamicClient = await Browser.getClientData(clientOpt.client)
            clientOpt = Object.assign({}, clientOpt, dynamicClient)
            clientOpt.updateTime = new Date()
            fs.writeFileSync(clientOptFile, JSON.stringify(clientOpt), { encoding: 'utf8' })
            resolve(clientOpt)
        } catch (err) {
            reject(err)
        }
    })
}

async function setBrowserSetting() {
    const platform = Browser.getUserPlatform()
    clientOpt = await getClientOpt()
    settings.set('app', {
        clientOpt,
        platform,
    })
}

function quitProcess() {
    if (sslocalServer) {
        sslocalServer.closeAll()
    }
}

async function createWindow() {
    try {
        const winOpt = {
            show: false,
            width: 1024,
            height: 768,
            title: clientOpt.productName,
            webPreferences: {
                webSecurity: false,
                allowRunningInsecureContent: true,
                plugins: true,
            },
            icon: fs.existsSync(path.join(__dirname, 'config', 'icon.ico'))
                ? path.join(__dirname, 'config', 'icon.ico')
                : null,
        }
        // Check if the safetybrowser needs to be updated.
        AutoUpdater.checkUpdatesAndNotify()

        await Flash.checkExistFlashPlugin(clientOpt)

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
                details.requestHeaders['User-Agent'] = `${
                    details.headers['User-Agent']
                } t1t_safetybrowser/${pjson.version}`
                details.requestHeaders['X-SS-CLIENT-ADDR'] = await Utils.getPubIP(
                    clientOpt,
                    typeof sslocalServer === 'object',
                )
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
            newWin.once('ready-to-show', () => {
                newWin.show()
                newWin.focus()
            })
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
            require('devtron').install() // inspect, monitor, and debug our Electron app
        }

        loadingWin.hide()
        win.show()
        win.maximize()
    } catch (err) {
        log.error(err)
        dialog.showErrorBox('Error', err.message)
        quitProcess()
    }
}

function openInfoPage() {
    const winOpt = {
        width: 720,
        height: 415,
        frame: false,
        alwaysOnTop: true,
    }
    loadingWin = new BrowserWindow(winOpt)
    loadingWin.loadURL(`file://${__dirname}/view/startPage.html`)
}

function initialize() {
    app.on('ready', async () => {
        openInfoPage()
        loadModule()
        await setBrowserSetting()
        // Enable flash plugin for app
        Flash.enableFlashPlugin(app, clientOpt)
        createWindow()
    })

    app.on('window-all-closed', () => {
        app.quit()
    })

    app.on('quit', () => {
        quitProcess()
    })
}

initialize()
