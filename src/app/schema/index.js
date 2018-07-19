const net = require('net')
const url = require('url')

/**
 * Judge whether open ss server proxy
 */
const checkEnabledSSProxy = (homeUrl, clientOpt) => {
    try {
        const parseUrl = url.parse(homeUrl, true);
        const hostname = parseUrl.hostname
        // Rule:
        // * Return false if hostname include 't1t.games', otherwise return false 
        if (hostname.indexOf('t1t.games') > -1) {
            return false
        } else {
            return true
        }
    } catch (ex) {
        throw new Error(ex)
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
        socket.setTimeout(3000)
        socket.connect(ssConf.serverPort, ssConf.serverAddr, () => {
            socket.destroy()
            resolve(ssConf)
        })
        socket.on('timeout', () => {
            socket.destroy()
            reject()
        })
        socket.on('error', (err) => {
            reject()
        })
    } catch (ex) {
        throw ex
    }
})

module.exports = { checkAvailableSS, checkEnabledSSProxy }