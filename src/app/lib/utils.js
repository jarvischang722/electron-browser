require('date-utils')
const fs = require('fs')
const path = require('path')
const request = require('request')
const exec = require('child_process').execFile
const { dialog } = require('electron')
const storage = require('electron-json-storage')
const config = require('../config/common.json')

const download = (link, dest, callback) => {
    const file = fs.createWriteStream(dest)
    request.get(link)
    .on('error', (err) => {
        return callback(err)
    })
    .pipe(file)
    file.on('finish', () => {
        file.close(callback)
    })

    file.on('error', (err) => {
        fs.unlink(dest)
        return callback(err)
    })
}

const runFirstTimeToday = (client, callback) => {
    const today = new Date().toFormat('YYYYMMDD')
    const key = `${client}_${today}`
    storage.get(key, (err, data) => {
        if (err) return callback(null, true)
        if (data === '1') return callback(null, false)
        storage.set(key, '1', () => {
            return callback(null, true)
        })
    })
}

const popupHint = (link, filePath) => {
    dialog.showMessageBox({
        message: '有更新可用, 点击确定开始下载',
        buttons: ['OK', 'Cancel'],
    }, (res) => {
        if (res === 0) {
            download(link, filePath, (err) => {
                if (!err) exec(filePath)
            })
        }
    })
}

const autoUpdate = (app, platform, client, currentVer) => {
    try {
        if (!platform || platform !== 'windows' || !client) return
        runFirstTimeToday(client, (err, first) => {
            if (err || !first) return
            let needUpdate = false
            const apiMain = config.serviceAddr
            const reqUrl = `${apiMain}/browser/version?platform=${platform}&client=${client}`
            request.get(reqUrl, (requestErr, res, body) => {
                if (!requestErr && body) {
                    body = JSON.parse(body)
                    const { version, link } = body
                    if (version && currentVer) {
                        const [a, b, c] = currentVer.split('.')
                        const [x, y, z] = version.split('.')
                        if (+x > +a) needUpdate = true
                        if (+x === +a && +y > +b) needUpdate = true
                        if (+x === +a && +y === +b && +z > +c) needUpdate = true
                    } else {
                        needUpdate = true
                    }
                    if (needUpdate && link) {
                        const filePath = path.join(app.getPath('userData'), 'install.exe')
                        popupHint(link, filePath)
                    }
                }
            })
        })
    } catch (err) {
        return
    }
}

module.exports = {
    autoUpdate,
}
