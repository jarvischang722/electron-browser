const request = require('request')

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


module.exports = { getPubIPEnableSS }
