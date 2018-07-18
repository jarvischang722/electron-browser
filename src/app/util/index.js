const net = require('net')
const request = require('request')

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
        socket.setTimeout(3000)
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


module.exports = { checkAvailableSS, getPubIPEnableSS }
