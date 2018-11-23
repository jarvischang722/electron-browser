const fs = require('fs')
const path = require('path')
const url = require('url')
const ncp = require('ncp').ncp
const asar = require('asar')
const log4js = require('log4js')
const builder = require('../install-script/builder')

const logger = log4js.getLogger()

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

const asarSync = (src, dest) =>
    new Promise((resolve, reject) => {
        asar.createPackage(src, dest, (err) => {
            if (err) return reject(err)
            return resolve()
        })
    })
const compiler = options =>
    new Promise((resolve, reject) => {
        builder(options, (err) => {
            if (err) return reject(err)
            return resolve()
        })
    })

const writePacFile = async (optionPath, options) => {
    const { localPort } = options.proxyOptions
    let homeUrl = options.proxyUrls || options.homeUrl
    if (!Array.isArray(homeUrl)) {
        homeUrl = [homeUrl]
    }
    let filterString = ''
    for (const page of homeUrl) {
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
    const pacFile = path.join(optionPath, 'default.pac')
    fs.writeFileSync(pacFile, pac)
    await copy(pacFile, 'src/app/config/default.pac')
}

const run = async (optionPath) => {
    try {
        const optionFile = path.join(optionPath, 'client.json')
        const iconType = process.platform === 'darwin' ? 'png' : 'ico'  // platform 'darwin'= macOS ; 'win32'=Windows
        const icon = path.join(optionPath, `icon.${iconType}`)

        const options = require(optionFile)

        if (options.enabledProxy && options.proxyOptions) {
            await writePacFile(optionPath, options)
        }

        await copy(optionFile, 'src/app/config/client.json')
        await copy(icon, `src/app/config/icon.${iconType}`)

        await asarSync('src/app', 'dist/unpacked/resources/app.asar')
        await compiler(options)

        logger.info('Build finished successfully.')
    } catch (err) {
        throw err
    }
}

const client = process.env.npm_config_client || 'tripleone'
const optionPath = path.join(__dirname, '../..', `src/clients/${client}`)

if (fs.existsSync(optionPath)) {
    run(optionPath)
} else {
    logger.warn(`Invalid client ${client}`)
}
