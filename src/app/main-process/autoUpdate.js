const path = require('path')
const request = require('request')
const childProcess = require('child_process')
const { dialog } = require('electron')
const storage = require('electron-json-storage')
const config = require('../config/common.json')
const uuidV4 = require('uuid/v4')
const Utils = require('../lib/utils')

const runFirstTimeToday = (client, callback) => {
    const today = new Date().toFormat('YYYYMMDD')
    const key = `${client}_${today}`
    storage.get(key, (err, data) => {
        if (err) return callback(null, true)
        if (data === '1') return callback(null, false)
        storage.set(key, '1', () => callback(null, true))
    })
}

const popupHint = (link, filePath) => {
    Utils.download(link, filePath, (err) => {
        if (err) return
        dialog.showMessageBox(
            {
                message: '有更新可用, 点击确定开始安装',
                buttons: ['OK', 'Cancel'],
            },
            (res) => {
                if (res === 0) childProcess.execFileSync(filePath)
            },
        )
    })
}

const autoUpdate = (app, platform, client) => {
    try {
        if (!platform || platform !== 'windows' || !client) return
        runFirstTimeToday(client, (err, first) => {
            if (err || !first) return
            let needUpdate = false
            const apiMain = config.serviceAddr
            const currentVer = config.version
            const reqUrl = `${apiMain}/browser/version?platform=${platform}&client=${client}`
            request.get(reqUrl, (requestErr, res, body) => {
                if (!requestErr && body) {
                    try {
                        body = JSON.parse(body)
                    } catch (parseErr) {
                        return
                    }
                    const { latestVersion, link } = body
                    if (latestVersion && currentVer) {
                        const [a, b, c] = currentVer.split('.')
                        const [x, y, z] = latestVersion.split('.')
                        if (+x > +a) needUpdate = true
                        if (+x === +a && +y > +b) needUpdate = true
                        if (+x === +a && +y === +b && +z > +c) needUpdate = true
                    } else {
                        needUpdate = true
                    }
                    needUpdate = true
                    if (needUpdate && link) {
                        const filePath = path.join(app.getPath('userData'), `${uuidV4()}.exe`)
                        popupHint(link, filePath)
                    }
                }
            })
        })
    } catch (err) {

    }
}

module.exports = autoUpdate
