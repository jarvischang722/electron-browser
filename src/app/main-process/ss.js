require('date-utils')
const net = require('net')
const url = require('url')
const ssLocal = require('../lib/shadowsocks/ssLocal')
const Utils = require('../lib/utils')
const { dialog } = require('electron')
const i18n = new (require('../lib/i18n'))()

/**
 * Use net's socket module to check if ss server is working.
 * @param {Object} ssConf : shadowsocks's configuration
 */
const checkSSIsAvail = ssConf =>
    new Promise((resolve, reject) => {
        try {
            const socket = new net.Socket()
            socket.setTimeout(5000)
            socket.connect(
                ssConf.serverPort,
                ssConf.serverAddr,
                () => {
                    socket.destroy()
                    resolve(ssConf)
                },
            )
            socket.on('timeout', () => {
                socket.destroy()
                reject(new Error('timeout'))
            })
            socket.on('error', (err) => {
                reject(err)
            })
        } catch (ex) {
            throw ex
        }
    })

/**
 * Check the shadowsocks server is available.
 * @param {Object} clientConf
 */
const checkAvailableSS = clientConf =>
    new Promise(async (resolve) => {
        try {
            const ssList = clientConf.ssServerList || []
            if (clientConf.proxyOptions) {
                ssList.unshift(clientConf.proxyOptions)
            }
            const promiseArr = ssList.map(ssConf =>
                checkSSIsAvail(ssConf).catch(err => ({ error: err })),
            )

            const results = await Promise.all(promiseArr)
            const validSS = results.filter(s => s.error === undefined)

            if (validSS.length === 0) {
                throw new Error(i18n.__('Ss').ServerNotWorking)
            }
            resolve(validSS[0])
        } catch (error) {
            resolve({ error })
        }
    })

/**
 * Judge whether open ss server proxy
 */
const checkEnabledSSProxy = (homeUrl) => {
    try {
        const parseUrl = url.parse(homeUrl, true)
        const hostname = parseUrl.hostname
        // * Rule: Return false if hostname include 't1t.games', otherwise return true
        if (hostname.indexOf('t1t.games') > -1) {
            return false
        }
        return true
    } catch (ex) {
        throw new Error(ex)
    }
}

const startShadowSocksServer = async (clientOpt) => {
    // Before start SS server,
    // verify that at least one of these shadowsocks server is available.
    let isSSOk = false
    let sslocalServer
    const ssProxy = await checkAvailableSS(clientOpt)
    if (ssProxy.error) {
        dialog.showMessageBox({
            type: 'warning',
            title: i18n.__('Ss.SecurityWarning'),
            message: ssProxy.error.message,
        })
    } else {
        isSSOk = true
        clientOpt.proxyOptions = Object.assign({}, clientOpt.proxyOptions, ssProxy)
    }

    // After start SS Server,
    // verify that public ip and client configuration serverAddr are the same.
    if (isSSOk) {
        sslocalServer = ssLocal.startServer(clientOpt.proxyOptions, true)
        // The line must be placed after server started.
        const pubIP = await Utils.getPubIP(clientOpt, true)
        if (pubIP !== clientOpt.proxyOptions.serverAddr) {
            dialog.showMessageBox({
                type: 'warning',
                title: i18n.__('Ss').SecurityWarning,
                message: i18n.__('Ss').ServerNotWorking,
            })
        }
    }
    return sslocalServer
}

module.exports = {
    checkAvailableSS,
    checkEnabledSSProxy,
    startShadowSocksServer,
}
