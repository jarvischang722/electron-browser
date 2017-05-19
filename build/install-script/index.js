const ncp = require('ncp').ncp
const rcedit = require('rcedit')
const asar = require('asar')
const innoSetup = require('innosetup-compiler')

const copy = (source, destination) => {
    return new Promise((resolve, reject) => {
        ncp(source, destination, (err) => {
            if (err) return reject(err)
            return resolve()
        })
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
        asar.createPackage(src, dest, () => {
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

const run = async (options) => {
    const exePath = 'build/electron/safety-browser.exe'
    const rceditOptions = {
        'version-string': {
            CompanyName: options.CompanyName,
            FileDescription: options.FileDescription,
            LegalCopyright: options.LegalCopyright || 'Copyright 2017',
            ProductName: options.ProductName,
        },
        'file-version': options.Version,
        'product-version': options.Version,
        icon: options.icon,
    }

    await copy('build/electron/electron.exe', exePath)
    await rceditSync(exePath, rceditOptions)
    await copy('src/lang/*.json', 'build/electron/app/lang/')
    await copy('src/lib/client.json', 'build/electron/app/lib/client.json')
    await copy('src/app/package.json', 'build/electron/app/package.json')
    await copy('src/app/default.pac', 'build/electron/app/default.pac')
    await copy(options.iss, 'build/install-script/client_info.iss')
    await copy(options.icon, 'build/install-script/safety-browser.ico')

    await asarSync('src/app', 'build/electron/resources/app.asar')
    await compiler('build/install-script/smartbrowser.iss', {
        gui: false,
        verbose: true,
        signtoolname: 'signtool',
        signtoolcommand: '"build/install-script/signtool.exe" sign /f "C:\\absolute\\path\\to\\smartbrowser.pfx" /t http://timestamp.globalsign.com/scripts/timstamp.dll /p "MY_PASSWORD" $f'
    })

    console.log(222)
}

run(options)