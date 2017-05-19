const path = require('path')
const ncp = require('ncp').ncp
const rcedit = require('rcedit')
const asar = require('asar')
const innoSetup = require('innosetup-compiler')

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
    const optionFile = `${optionPath}/client.json`
    const icon = `${optionPath}/icon.ico`
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

    // await copy('src/app/default.pac', 'dist/unpacked/app/default.pac')
    // await copy(options.iss, 'build/install-script/client_info.iss')

    await copy(optionFile, 'src/app/config/client.json')
    await copy(icon, 'build/install-script/safety-browser.ico')
    await copy('build/plugins', 'dist/unpacked/plugins')

    await asarSync('src/app', 'dist/unpacked/resources/app.asar')
    await compiler('build/install-script/smartbrowser.iss', {
        gui: false,
        verbose: true,
        O: `dist/${options.client}`,
        F: `safety-browser-setup-${options.version}`,
        signtoolname: 'signtool',
        signtoolcommand: '"build/install-script/signtool.exe" sign /f "C:\\projects\\safety-browser\\build\\install-script\\smartbrowser.pfx" /t http://timestamp.globalsign.com/scripts/timstamp.dll /p "MY_PASSWORD" $f'
    })

    console.log('Finished')
}


// TODO: get options from src/options, then different clients only generate different options folder
// 執行build命令 npm run build, 使用默認config, 
// 如果傳入參數比如npm run build -c tripleone, 那麽options去找對應的clients的folder,找不到抛錯
// 給QA使用的UI, 根據輸入的文字(比如主頁), 和上傳的文件(比如圖標), 根據客戶的名字, 生成一個對應文件夾, 如果已存在, 提示是否覆蓋
// 然後點擊生成安裝文件, 後臺實際上是執行帶參數的命令, 
// 一些路徑配置在config裏, 比如pre build文件的路徑, clients的主路徑
const client = process.env.npm_config_client || 'tripleone'
const optionPath = path.join(__dirname, '../..', `src/clients/${client}`)


run(optionPath)
