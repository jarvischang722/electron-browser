const fs = require('fs')
const path = require('path')
const request = require('request')
const utils = require('../lib/utils')
const commonOpt = require('../config/common.json')
const progress = require('request-progress')
const ProgressBar = require('electron-progressbar')
const settings = require('electron-settings')

const enableFlashPlugin = async (app, clientOpt) => {
    let pluginName
    let flashVersion
    const platform = settings.get('app.platform')
    switch (platform) {
    case 'windows':
        flashVersion = '25.0.0.171'
        if (process.arch === 'x64') {
            pluginName = 'pepflashplayer64_25_0_0_171.dll'
        } else {
            pluginName = 'pepflashplayer32_25_0_0_171.dll'
        }
        break
    case 'mac':
        pluginName = 'PepperFlashPlayer.plugin'
        flashVersion = '29.0.0.140'
        break
    case 'linux':
        flashVersion = '25.0.0.171'
        if (process.arch === 'x64') {
            pluginName = 'libpepflashplayer64_25_0_0_171.so'
        } else {
            pluginName = 'libpepflashplayer32_25_0_0_171.so'
        }
        break
    default:
        break
    }

    const flashPath = path.join(__dirname, '..', '..', 'plugins', pluginName)

    if (clientOpt.enabledFlash) {
        app.commandLine.appendSwitch('ppapi-flash-path', flashPath)
        app.commandLine.appendSwitch('ppapi-flash-version', flashVersion)
    }

    settings.set('flash', {
        path: flashPath,
        pluginName,
    })
}


/**
 * Download flashplayer from service.
 */
function downloadFP(fileName, clientOpt, platform) {
    return new Promise((resolve) => {
        const pluginPath = path.resolve(__dirname, '..', '..', 'plugins')

        if (!fs.existsSync(pluginPath)) {
            fs.mkdirSync(pluginPath)
        }

        const link = `${commonOpt.serviceAddr}/pub_plugins/flashplayer/${fileName}`
        const dest = path.resolve(pluginPath, fileName)
        const progressBar = new ProgressBar({
            indeterminate: false,
            title: `${clientOpt.client}-${commonOpt.version}`,
            text: `Downloading ${fileName}...`,
            browserWindow: {
                height: 250,
            },
            style: {
                detail: {
                    'line-height': '20px',
                },
                bar: {
                    position: 'relative',
                    top: '60px',
                },
            },
        })
        progress(request(link))
            .on('progress', (state) => {
                let speedUnit = 'KB'
                let speed = Math.round(state.speed / 1024)
                if (speed > 1024) {
                    speedUnit = 'MB'
                    speed = Math.round(speed / 1024)
                }
                const percent = Math.round(state.percent * 100)
                const totalSize = Math.round(state.size.total / 1024)
                const transferredSize = Math.round(state.size.transferred / 1024)
                const remainingTime = Math.round(state.time.remaining)
                const elapsedTime = Math.round(state.time.elapsed)
                progressBar.detail = `Speed:  ${speed} ${speedUnit}/s <br>  
                                  Elapsed time: ${elapsedTime} sec <br> 
                                  Remaining time: ${remainingTime} sec <br> <br>
                                ${transferredSize} KB of ${totalSize} KB (${percent} %)`
                progressBar.value = percent
            })
            .on('end', async () => {
                if (platform === 'mac') {
                    await utils.upzip(dest, pluginPath)
                    // Delete this file after one second of decompression
                    // and avoid not yet unzipping complete
                    setTimeout(() => {
                        fs.unlinkSync(dest)
                    }, 1000)
                }
                progressBar.close()
                resolve()
            })
            .pipe(fs.createWriteStream(dest))
    })
}

const checkExistFlashPlugin = async (clientOpt) => {
    const flashPath = settings.get('flash.path')
    let pluginName = settings.get('flash.pluginName')
    const platform = settings.get('app.platform')
    if (!fs.existsSync(flashPath)) {
        if (platform === 'mac') pluginName = `${pluginName}.zip`
        await downloadFP(pluginName, clientOpt, platform)
    }
}

module.exports = {
    enableFlashPlugin,
    checkExistFlashPlugin,
}