const fs = require('fs')
const path = require('path')
const url = require('url')
const request = require('request')
const commonOpt = require('../config/common.json')

const getHomeurl = clientOpt =>
    new Promise((resolve) => {
        request(
            {
                url: `${commonOpt.serviceAddr}/user/getHomeurl?clientName=${clientOpt.client}`,
                method: 'GET',
                timeout: 5000,
                json: true,
            },
            (error, response, body) => {
                if (error) {
                    log.error(error)
                }
                let homeUrl = []
                const homeUrlList = !error && body && body.homeUrlList ? body.homeUrlList : []
                if (homeUrlList.length === 0) {
                    if (Array.isArray(clientOpt.homeUrl)) {
                        const arrLen = clientOpt.homeUrl.length
                        const rdmIdx = Math.floor(Math.random() * arrLen)
                        homeUrl = clientOpt.homeUrl[rdmIdx]
                    } else {
                        homeUrl = clientOpt.homeUrl
                    }
                } else {
                    const arrLen = homeUrlList.length
                    const rdmIdx = Math.floor(Math.random() * arrLen)
                    homeUrl = homeUrlList[rdmIdx]
                }
                resolve(homeUrl)
            },
        )
    })

/**
 * Generate pac file by homeurl of client for the client
 * @param {Object} clientOpts client's configuration
 */
const writePacFile = async (clientOpts) => {
    const { homeUrl, proxyOptions, ssDomain } = clientOpts
    const { localPort } = proxyOptions
    const urls = [...homeUrl, ...ssDomain]
    let filterString = ''
    for (const page of urls) {
        const pageUrl = url.parse(page)
        let host = pageUrl.host || pageUrl.path
        const idx = host.lastIndexOf('.')
        const suffix = host.slice(idx + 1)
        if (idx > -1) {
            host = host.slice(0, idx)
            const main = host.slice(host.lastIndexOf('.') + 1)
            filterString += `
        if (/(?:^|\\.)${main}\\.${suffix}$/gi.test(host)) return "+proxy";`
        } else {
            filterString += `
        if (/(?:^|\\.)${suffix}$/gi.test(host)) return "+proxy";`
        }
    }
    const pac = `var FindProxyForURL = function(init, profiles) {
    return function(url, host) {
        "use strict";
        var result = init, scheme = url.substr(0, url.indexOf(":"));
        do {
            result = profiles[result];
            if (typeof result === "function") result = result(url, host, scheme);
        } while (typeof result !== "string" || result.charCodeAt(0) === 43);
        return result;
    };
}("+safe", {
    "+safe": function(url, host, scheme) {
        "use strict";${filterString}
        return "DIRECT";
    },
    "+proxy": function(url, host, scheme) {
        "use strict";
        return "SOCKS5 127.0.0.1:${localPort}; SOCKS 127.0.0.1:${localPort}; DIRECT;";
    }
});
`
    const pacFile = path.join(__dirname, '..', 'config', 'default.pac')
    fs.writeFileSync(pacFile, pac)
}

const getUserPlatform = () => {
    let platform
    switch (process.platform) {
    case 'win32':
        platform = 'windows'
        break
    case 'darwin':
        platform = 'mac'
        break
    case 'linux':
        platform = 'linux'
        break
    default:
        break
    }

    return platform
}

const getClientData = clientName =>
    new Promise((resolve, reject) => {
        const reqUrl = `${commonOpt.serviceAddr}/browser/clientData?clientName=${clientName}`
        request.get({ url: reqUrl, json: true }, (requestErr, res, body) => {
            if (requestErr) return reject(requestErr)
            if (body.error) return reject(body.error)
            resolve(body)
        })
    })

module.exports = {
    getHomeurl,
    writePacFile,
    getUserPlatform,
    getClientData,
}
