require('date-utils')
const fs = require('fs')
const request = require('request')
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
        const Agent = require('socks5-http-client/lib/Agent')
        const options = {
            url: 'http://api.ipify.org?format=json',
            method: 'GET',
            timeout: 5000,
            json: true,
        }
        if (enableSS) {
            options.agentClass = Agent
            options.agentOptions = {
                socksHost: clientOpt.proxyOptions.localAddr || '127.0.0.1',
                socksPort: clientOpt.proxyOptions.localPort || '1080',
            }
        }
        request(options, (error, response, body) => {
            if (error) {
                log.error(error)
                return resolve('')
            }
            resolve(body.ip)
        })
    })

const delay = ms =>
    new Promise((resolve, reject) => {
        if (typeof ms !== 'number') reject()
        setTimeout(() => {
            resolve()
        }, ms)
    })

module.exports = {
    download,
    upzip,
    copy,
    getPubIP,
    delay,
}
