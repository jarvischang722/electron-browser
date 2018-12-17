require('date-utils')
const fs = require('fs')
const path = require('path')
const request = require('request')
const exec = require('child_process').execFile
const { dialog } = require('electron')
const storage = require('electron-json-storage')
const config = require('../config/common.json')
const uuidV4 = require('uuid/v4')
const extract = require('extract-zip')
const ncp = require('ncp').ncp

const download = (link, dest, callback) => {
    const file = fs.createWriteStream(dest)
    request
        .get(link)
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
        dialog.showMessageBox(
            {
                message: '有更新可用, 点击确定开始安装',
                buttons: ['OK', 'Cancel'],
            },
            (res) => {
                if (res === 0) exec(filePath)
            },
        )
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
    } catch (err) {}
}

/**
 * Uncompress file
 * @param {String} source : The path to be uncompressed
 * @param {String} dest ：Uncompress the target path
 */
const upzip = (source, dest) =>
    new Promise((resolve, reject) => {
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

/**
 * Copy file
 * @param {String} src file source
 * @param {*} dest destination of file
 * @param {*} options other options
 */
const copy = (src, dest, options) =>
    new Promise((resolve, reject) => {
        if (options) {
            ncp(src, dest, options, (err) => {
                if (err) return reject(err)
                return resolve()
            })
        } else {
            ncp(src, dest, (err) => {
                if (err) return reject(err)
                return resolve()
            })
        }
    })

/**
 * Get client's public IP.
 * @param {Object} clientOpt: Agent configuration
 * @param {Boolean} enableSS : Whether to open shadowsocks server
 */
const getPubIP = (clientOpt = {}, enableSS) =>
    new Promise((resolve) => {
        const agent = require('socks5-http-client/lib/Agent')
        const options = {
            url: 'http://api.ipify.org?format=json',
            method: 'GET',
            timeout: 3000,
            json: true,
        }
        if (enableSS) {
            options.agentClass = agent
            options.agentOptions = {
                socksHost: clientOpt.proxyOptions.localAddr || '127.0.0.1',
                socksPort: clientOpt.proxyOptions.localPort || '1080',
            }
        }
        request(options, (error, response, body) => {
            if (body) {
                resolve(body.ip)
            } else {
                resolve('')
            }
        })
    })

module.exports = {
    autoUpdate,
    download,
    upzip,
    copy,
    getPubIP,
}
