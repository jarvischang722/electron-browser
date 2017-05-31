const fs = require('fs')
const path = require('path')
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

const run = async (optionPath) => {
    const commonOpt = require('../../src/app/config/common.json')
    const optionFile = path.join(optionPath, 'client.json')
    const icon = path.join(optionPath, 'icon.ico')
    const options = require(optionFile)
    const rceditOptions = {
        'version-string': {
            CompanyName: options.companyName,
            FileDescription: options.fileDescription,
            LegalCopyright: options.legalCopyright || 'Copyright 2017',
            ProductName: options.productName,
        },
        'file-version': options.version,
        'product-version': options.version,
        icon,
    }

    await copy('dist/unpacked/electron.exe', 'dist/unpacked/safety-browser.exe', { clobber: false })
    await rceditSync('dist/unpacked/safety-browser.exe' , rceditOptions)

    if (fs.existsSync(path.join(optionPath, 'default.pac'))) {
        await copy(path.join(optionPath, 'default.pac'), 'src/app/config/default.pac')
    }

    await copy(optionFile, 'src/app/config/client.json')
    await copy(icon, 'src/app/config/icon.ico')
    await copy('src/plugins', 'dist/unpacked/plugins')

    await asarSync('src/app', 'dist/unpacked/resources/app.asar')
    await compiler('build/install-script/smartbrowser.iss', {
        gui: false,
        verbose: true,
        signtoolname: 'signtool',
        signtoolcommand: `"build/install-script/signtool.exe" sign /f "${commonOpt.projectHomeBase}\\build\\install-script\\smartbrowser.pfx" /t http://timestamp.globalsign.com/scripts/timstamp.dll /p "12345678" $f`,
        O: `dist/${options.client}`,
        F: `safety-browser-${options.client}-setup-${options.version}`,
        DProjectHomeBase: commonOpt.projectHomeBase,
        DCLIENT: options.client,
        DCLIENT_GUID: `{${options.clientId}}`,
        DAPP_NAME: 'SmartBrowserName',
        DAPP_VERSION: options.version,
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
