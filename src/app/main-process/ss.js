require('date-utils')
const net = require('net')
const fs = require('fs')
const url = require('url')
const path = require('path')
const Utils = require('../lib/utils')
const { dialog, shell } = require('electron')
const i18n = new (require('../lib/i18n'))()
const settings = require('electron-settings')
const open = require('mac-open')
const { execSync } = require('child_process')
const ssLocal = require('../lib/shadowsocks/ssLocal')

const PLATFORM = settings.get('app.platform')
const CIPHER_LIST = require('crypto').getCiphers()
/**
 * Use net's socket module to check if ss server is working.
 * @param {Object} ssConf : shadowsocks's configuration
 */
const checkSSIsAvail = ssConf =>
    new Promise((resolve, reject) => {
        try {
            const socket = new net.Socket()
            socket.setTimeout(5000)
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

/**
 * Check the shadowsocks server is available.
 * @param {Object} clientConf
 */
const checkAvailableSS = clientConf =>
    new Promise(async (resolve) => {
        try {
            let ssList = clientConf.ssServerList || []
            if (clientConf.proxyOptions) {
                ssList.unshift(clientConf.proxyOptions)
            }
            // 因為mac版不打開ss application, 所以只能開啟crypto有支持的演算法
            if (PLATFORM === 'mac') {
                ssList = ssList.filter(s => CIPHER_LIST.indexOf(s.method) > -1)
            }
            const promiseArr = ssList.map(ssConf =>
                checkSSIsAvail(ssConf).catch(err => ({ error: err })),
            )

            const results = await Promise.all(promiseArr)
            const validSS = results.filter(s => s.error === undefined)

            if (validSS.length === 0) {
                throw new Error(i18n.__('Ss').ServerNotWorking)
            }
            resolve(validSS[Math.floor(Math.random() * validSS.length)])
        } catch (error) {
            resolve({ error })
        }
    })

/**
 * Judge whether open ss server proxy
 */
const checkEnabledSSProxy = (homeUrl) => {
    try {
        const clientOpt = settings.get('app.clientOpt')
        const parseUrl = url.parse(homeUrl, true)
        const hostname = parseUrl.hostname
        // * Rule: Return false if hostname include 't1t.games', otherwise return true
        if (hostname.indexOf('t1t.games') > -1) {
            return false
        }
        return clientOpt.enabledProxy
    } catch (ex) {
        throw new Error(ex)
    }
}

const ssProcess = () => {
    const killProcess = {
        mac: () => {
            const ssPID = execSync("ps -A | grep -m1 ShadowsocksX-NG | awk '{print $1}'", {
                encoding: 'utf8',
            })
            const result = execSync(`kill -9 ${ssPID}`, { encoding: 'utf8' })
            log.warn(`Killed PID [${ssPID}] for shadowsocks`)
            return result
        },
        windows: () => {
            try {
                let processInfo = execSync('tasklist | findstr shadowsocks', { encoding: 'utf8' })
                processInfo = processInfo.split(' ').filter(d => d !== '')
                const ssPID = processInfo[1]
                const result = execSync(`taskkill /f /PID ${ssPID}`)
                log.warn(`Killed PID [${ssPID}] for shadowsocks`)
                return result
            } catch (ex) {
                log.error(ex.stdout)
            }
        },
    }
    return {
        closeAll: killProcess[PLATFORM],
    }
}

/*
 * 复制目录中的所有文件包括子目录
 * @param{ String } 需要复制的目录
 * @param{ String } 复制到指定的目录
 */
const copy = (src, dst) => {
    const { statSync } = fs
    // 读取目录中的所有文件/目录
    const paths = fs.readdirSync(src)

    paths.forEach(async (_path) => {
        const _src = `${src}/${_path}`
        const _dst = `${dst}/${_path}`
        let readable = {}
        let writable = {}

        const st = statSync(_src)

        // 判断是否为文件
        if (st.isFile()) {
            // 创建读取流
            readable = fs.createReadStream(_src)
            // 创建写入流
            writable = fs.createWriteStream(_dst)
            // 通过管道来传输流
            readable.pipe(writable)
        }
        // 如果是目录则递归调用自身
        else if (st.isDirectory()) {
            await copy(_src, _dst)
        }
    })
}

const checkExistPlugin = async () => {
    const ssDirPath = path.resolve(__dirname, '..', '..', 'plugins', 'shadowsocks')
    if (!fs.existsSync(ssDirPath)) {
        fs.mkdirSync(ssDirPath)
    }
    if (!fs.existsSync(`${ssDirPath}/${PLATFORM}`)) {
        const zipSrc = path.resolve(
            __dirname,
            '..',
            'tools',
            'shadowsocks',
            PLATFORM,
            'shadowsocks.zip',
        )
        const zipPath = path.resolve(
            __dirname,
            '..',
            '..',
            'plugins',
            'shadowsocks',
            'shadowsocks.zip',
        )
        await Utils.copy(zipSrc, zipPath)
        await Utils.upzip(zipPath, ssDirPath)
        await Utils.delay(1000)
        fs.unlinkSync(zipPath)
    }
}

const writeSSConfig = async (proxyOptions) => {
    const configPath = path.resolve(__dirname, '..', '..', 'plugins', 'shadowsocks', 'windows')
    const ssConfigsPath = path.resolve(configPath, 'gui-config.json')
    if (!fs.existsSync(ssConfigsPath)) {
        const ssConfigsSrcPath = path.resolve(configPath, 'gui-config.json.sample')
        await Utils.copy(ssConfigsSrcPath, ssConfigsPath)
    }
    const ssConfigs = require(ssConfigsPath)
    const ssNewConfigs = [
        {
            server: proxyOptions.serverAddr,
            server_port: proxyOptions.serverPort,
            password: proxyOptions.password,
            method: proxyOptions.method,
            plugin: '',
            plugin_opts: '',
            plugin_args: '',
            remarks: proxyOptions.serverAddr,
            timeout: proxyOptions.timeout,
        },
    ]
    ssConfigs.configs = ssNewConfigs
    ssConfigs.index = ssNewConfigs.length - 1
    ssConfigs.localPort = proxyOptions.localPort

    fs.writeFileSync(ssConfigsPath, JSON.stringify(ssConfigs))
}

// Destroyed, not working
const runMacSS = () =>
    new Promise(async (resolve, reject) => {
        const ssAppPath = path.resolve(__dirname, '..', '..', 'plugins', 'shadowsocks', 'mac')
        const appPath = `${ssAppPath}/ShadowsocksX-NG.app`
        if (!fs.existsSync(appPath)) {
            await Utils.upzip(`${ssAppPath}/shadowsocks.app.zip`, `${ssAppPath}/`)
            await Utils.delay(1000)
        }
        open(appPath, { g: true }, (error) => {
            if (error) return reject(error)
            resolve()
        })
    })

const runWinSS = () =>
    new Promise(async (resolve) => {
        const ssAppPath = path.resolve(
            __dirname,
            '..',
            '..',
            'plugins',
            'shadowsocks',
            'windows',
            'shadowsocks.exe',
        )
        shell.openItem(ssAppPath)
        await Utils.delay(1000)
        resolve()
    })

const startLocalServer = clientOpt =>
    new Promise(async (resolve, reject) => {
        let sslocalServer
        try {
            const ssOptions = clientOpt.proxyOptions
            // 如果 getCiphers() 裡有支持ss method name的演算法，就用net啟動程式
            // 或是PLATFORM 是mac的話也用net啟動，因為mac 的ss application不能夠改變configuration
            if (CIPHER_LIST.indexOf(ssOptions.method) > -1 || PLATFORM === 'mac') {
                sslocalServer = ssLocal.startServer(ssOptions, true)
                return resolve(sslocalServer)
            }

            // 檢查有沒有SS application套件
            await checkExistPlugin()

            if (PLATFORM === 'windows') {
                await writeSSConfig(ssOptions)
                await runWinSS()
            }

            sslocalServer = ssProcess()
            resolve(sslocalServer)
        } catch (err) {
            reject(err)
        }
    })

const startShadowSocksServer = async (clientOpt) => {
    // Before start SS server,
    // verify that at least one of these shadowsocks server is available.
    let isSSOk = false
    let sslocalServer
    const ssProxy = await checkAvailableSS(clientOpt)
    if (ssProxy.error) {
        dialog.showMessageBox({
            type: 'warning',
            title: i18n.__('Ss.SecurityWarning'),
            message: ssProxy.error.message,
        })
    } else {
        isSSOk = true
        clientOpt.proxyOptions = Object.assign({}, clientOpt.proxyOptions, ssProxy)
    }

    // After start SS Server,
    // verify that public ip and client configuration serverAddr are the same.
    if (isSSOk) {
        sslocalServer = await startLocalServer(clientOpt)
        let retryNum = 0
        let pubIP = await Utils.getPubIP(clientOpt, true)
        while (pubIP === '' && retryNum < 3) {
            /* eslint-disable no-await-in-loop */
            await Utils.delay(1000)
            pubIP = await Utils.getPubIP(clientOpt, true)
            if (pubIP === '') {
                retryNum += 1
                log.warn(`retry: ${retryNum}`)
            } else {
                retryNum = 3
            }
        }
        const ssList = clientOpt.ssServerList.map(c => c.serverAddr)
        ssList.push(clientOpt.proxyOptions.serverAddr)
        if (ssList.indexOf(pubIP) === -1) {
            dialog.showMessageBox({
                type: 'warning',
                title: i18n.__('Ss').SecurityWarning,
                message: i18n.__('Ss').ServerNotWorking,
            })
        }
    }
    return sslocalServer
}

module.exports = {
    checkAvailableSS,
    checkEnabledSSProxy,
    startShadowSocksServer,
}
