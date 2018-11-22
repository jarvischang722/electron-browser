require('date-utils')
const request = require('request')
const net = require('net')
const url = require('url')

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
                throw new Error('Shadowsocks server is not working.')
            }
            resolve(validSS[0])
        } catch (error) {
            resolve({ error })
        }
    })

const getPubIPEnableSS = (clientOpt = {}) =>
    new Promise((resolve) => {
        const agent = require('socks5-http-client/lib/Agent')
        request(
            {
                url: 'http://api.ipify.org?format=json',
                method: 'GET',
                timeout: 3000,
                agentClass: agent,
                agentOptions: {
                    socksHost: clientOpt.proxyOptions.localAddr || '127.0.0.1',
                    socksPort: clientOpt.proxyOptions.localPort || '1080',
                },
                json: true,
            },
            (error, response, body) => {
                if (body) {
                    resolve(body.ip)
                } else {
                    resolve('')
                }
            },
        )
    })

/**
 * Judge whether open ss server proxy
 */
const checkEnabledSSProxy = (homeUrl) => {
    try {
        const parseUrl = url.parse(homeUrl, true)
        const hostname = parseUrl.hostname
        // Rule:
        // * Return false if hostname include 't1t.games', otherwise return false
        if (hostname.indexOf('t1t.games') > -1) {
            return false
        }
        return true
    } catch (ex) {
        throw new Error(ex)
    }
}

module.exports = {
    checkAvailableSS,
    getPubIPEnableSS,
    checkEnabledSSProxy,
}
