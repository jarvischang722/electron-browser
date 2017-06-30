const fs = require('fs')
const path = require('path')
const url = require('url')
const ncp = require('ncp').ncp
const rcedit = require('rcedit')
const asar = require('asar')
const innoSetup = require('innosetup-compiler')
const log4js = require('log4js')

const logger = log4js.getLogger()

const copy = (src, dest, options) => {
    return new Promise((resolve, reject) => {
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
}

const rceditSync = (exePath, options) => {
    return new Promise((resolve, reject) => {
        rcedit(exePath, options, (err) => {
            if (err) return reject(err)
            return resolve()
        })
    })
}

const asarSync = (src, dest) => {
    return new Promise((resolve, reject) => {
        asar.createPackage(src, dest, (err) => {
            if (err) return reject(err)
            return resolve()
        })
    })
}

const compiler = (iss, options) => {
    return new Promise((resolve, reject) => {
        innoSetup(iss, options, (err) => {
            if (err) return reject(err)
            return resolve()
        })
    })
}

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
    const commonOpt = require('../../src/app/config/common.json')
    const optionFile = path.join(optionPath, 'client.json')
    const icon = path.join(optionPath, 'icon.ico')
    const options = require(optionFile)
    const rceditOptions = {
        'version-string': {
            CompanyName: options.companyName,
            FileDescription: options.fileDescription,
            LegalCopyright: commonOpt.legalCopyright || 'Copyright 2017',
            ProductName: options.productName,
        },
        'file-version': commonOpt.version,
        'product-version': commonOpt.version,
        icon,
    }

    await copy('dist/unpacked/electron.exe', 'dist/unpacked/safety-browser.exe', { clobber: false })
    await rceditSync('dist/unpacked/safety-browser.exe' , rceditOptions)

    if (options.enabledProxy && options.proxyOptions) {
        await writePacFile(optionPath, options)
    }

    await copy(optionFile, 'src/app/config/client.json')
    await copy(icon, 'src/app/config/icon.ico')
    await copy('src/plugins', 'dist/unpacked/plugins')

    await asarSync('src/app', 'dist/unpacked/resources/app.asar')
    await compiler('build/install-script/smartbrowser.iss', {
        gui: false,
        verbose: true,
        signtool: 'tripleonesign=$p',
        O: `dist/${options.client}`,
        F: `safety-browser-${options.client}-setup-${commonOpt.version}`,
        DProjectHomeBase: commonOpt.projectHomeBase,
        DCLIENT: options.client,
        DCLIENT_GUID: `{${options.clientId}}`,
        DAPP_VERSION: commonOpt.version,
        DAPP_TITLE_EN: options.productNameEn,
        DAPP_TITLE_CH: options.productName,
        DAPP_ICO: icon,
    })

    logger.info('Build finished successfully.')
}

const client = process.env.npm_config_client || 'tripleone'
const optionPath = path.join(__dirname, '../..', `src/clients/${client}`)

if (fs.existsSync(optionPath)) {
    run(optionPath)
} else {
    logger.warn(`Invalid client ${client}`)
}
