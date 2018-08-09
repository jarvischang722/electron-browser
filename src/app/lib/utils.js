require('date-utils')
const fs = require('fs')
const path = require('path')
const request = require('request')
const exec = require('child_process').execFile
const { dialog } = require('electron')
const storage = require('electron-json-storage')
const config = require('../config/common.json')
const uuidV4 = require('uuid/v4')
const net = require('net')
const extract = require('extract-zip')

const download = (link, dest, callback) => {
    const file = fs.createWriteStream(dest)
    request.get(link)
        .on('error', err => callback(err))
        .pipe(file)
    file.on('finish', () => {
        file.close(callback)
    })

    file.on('error', (err) => {
        fs.unlink(dest)
        return callback(err)
    })
}

const runFirstTimeToday = (client, callback) => {
    const today = new Date().toFormat('YYYYMMDD')
    const key = `${client}_${today}`
    storage.get(key, (err, data) => {
        if (err) return callback(null, true)
        if (data === '1') return callback(null, false)
        storage.set(key, '1', () => callback(null, true))
    })
}

const popupHint = (link, filePath) => {
    download(link, filePath, (err) => {
        if (err) return
        dialog.showMessageBox({
            message: '有更新可用, 点击确定开始安装',
            buttons: ['OK', 'Cancel'],
        }, (res) => {
            if (res === 0) exec(filePath)
        })
    })
}

const autoUpdate = (app, platform, client) => {
    try {
        if (!platform || platform !== 'windows' || !client) return
        runFirstTimeToday(client, (err, first) => {
            if (err || !first) return
            let needUpdate = false
            const apiMain = config.serviceAddr
            const currentVer = config.version
            const reqUrl = `${apiMain}/browser/version?platform=${platform}&client=${client}`
            request.get(reqUrl, (requestErr, res, body) => {
                if (!requestErr && body) {
                    try {
                        body = JSON.parse(body)
                    } catch (parseErr) {
                        return
                    }
                    const { version, link } = body
                    if (version && currentVer) {
                        const [a, b, c] = currentVer.split('.')
                        const [x, y, z] = version.split('.')
                        if (+x > +a) needUpdate = true
                        if (+x === +a && +y > +b) needUpdate = true
                        if (+x === +a && +y === +b && +z > +c) needUpdate = true
                    } else {
                        needUpdate = true
                    }
                    if (needUpdate && link) {
                        const filePath = path.join(app.getPath('userData'), `${uuidV4()}.exe`)
                        popupHint(link, filePath)
                    }
                }
            })
        })
    } catch (err) {

    }
}

/**
 * Check the shadowsocks server is available.
 * @param {Object} clientConf
 */
const checkAvailableSS = async (clientConf) => {
    const ssList = clientConf.ssServerList || []
    if (clientConf.proxyOptions) {
        ssList.unshift(clientConf.proxyOptions)
    }
    let ssProxy
    for (const ssConf of ssList) {
        try {
            ssProxy = await checkSSIsAvailWithSocket(ssConf)
            if (ssProxy) {
                break
            }
        } catch (ex) {
            continue
        }
    }
    if (!ssProxy) throw new Error('Shadowsocks server is not working.')
    else {
        return ssProxy
    }
}

/**
 * Use net's socket module to check if ss server is working.
 * @param {Object} ssConf : shadowsocks's configuration
 */
const checkSSIsAvailWithSocket = async ssConf => new Promise((resolve, reject) => {
    try {
        const socket = new net.Socket()
        socket.setTimeout(5000)
        socket.connect(ssConf.serverPort, ssConf.serverAddr, () => {
            socket.destroy()
            resolve(ssConf)
        })
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

const getPubIPEnableSS = (clientOpt = {}) => new Promise((resolve, reject) => {
    const agent = require('socks5-http-client/lib/Agent')
    request({
        url: 'http://api.ipify.org?format=json',
        method: 'GET',
        timeout: 3000,
        agentClass: agent,
        agentOptions: {
            socksHost: clientOpt.proxyOptions.localAddr || '127.0.0.1',
            socksPort: clientOpt.proxyOptions.localPort || '1080',
        },
        json: true,
    }, (error, response, body) => {
        if (body) {
            resolve(body.ip)
        } else {
            resolve('')
        }
    })
})

/**
 * Uncompress file
 * @param {String} source : The path to be uncompressed
 * @param {String} dest ：Uncompress the target path
 */
const upzip = (source, dest) => new Promise((resolve, reject) => {
    try {
        extract(source, { dir: dest }, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    } catch (err) {
        reject(err)
    }
})

module.exports = {
    autoUpdate,
    download,
    checkAvailableSS,
    getPubIPEnableSS,
    upzip,
}
