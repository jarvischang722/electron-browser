const path = require('path')
const request = require('request')
const childProcess = require('child_process')
const { dialog } = require('electron')
const storage = require('electron-json-storage')
const config = require('../config/common.json')
const uuidV4 = require('uuid/v4')
const Utils = require('../lib/utils')
const fs = require('fs')

/**
 * 檢查用戶是不是今天第一次打開，避免每次打開都詢問，造成用戶困擾
 * @param {String} client
 */
const runFirstTimeToday = client =>
    new Promise((resolve) => {
        const today = new Date().toFormat('YYYYMMDD')
        const key = `${client}_${today}`
        storage.get(key, (err, data) => {
            if (err) return resolve(true)
            if (data === '1') return resolve(false)
            storage.set(key, '1', () => resolve(true))
        })
    })

/**
 * 彈出詢問是否更新的視窗
 * @param {String} link
 * @param {String} filePath
 */
const popupHint = (link, filePath) => {
    dialog.showMessageBox(
        {
            message: '有更新可用, 点击确定开始安装',
            buttons: ['OK', 'Cancel'],
        },
        (res) => {
            if (res === 0) {
                Utils.download(link, filePath, (err) => {
                    if (err) {
                        log.error(err)
                        dialog.showErrorBox('Error', 'Downlaod failed')
                        return
                    }
                    if (fs.execFileSync(filePath)) {
                        childProcess.execFileSync(filePath)
                    }
                })
            }
        },
    )
}

/**
 * 取得Client最新版本的資訊
 * @param {String} client
 * @param {String} platform
 */
const getClientLatestVer = (client, platform) =>
    new Promise((resolve, reject) => {
        try {
            const apiMain = config.serviceAddr
            const reqUrl = `${apiMain}/browser/version?platform=${platform}&client=${client}`
            request.get({ url: reqUrl, json: true }, (requestErr, res, body) => {
                if (requestErr) {
                    reject(requestErr)
                }
                const returnData = {
                    link: body.link,
                    latestVer: body.version,
                }
                resolve(returnData)
            })
        } catch (err) {
            reject(err)
        }
    })

/**
 * 檢查本機的版本是否為最新版
 * @param {Object} app
 * @param {String} platform
 * @param {String} client
 */
const checkUpdatesAndNotify = async (app, platform, client) => {
    try {
        if (!platform || platform !== 'windows' || !client) return
        const isRunFirstTimeToday = true || (await runFirstTimeToday(client))
        if (!isRunFirstTimeToday) return
        let needUpdate = false
        const currentVer = config.version
        const clientVerInfo = await getClientLatestVer(client, platform)
        const { latestVer, link } = clientVerInfo
        if (latestVer && currentVer) {
            const [a, b, c] = currentVer.split('.')
            const [x, y, z] = latestVer.split('.')
            if (+x > +a) needUpdate = true
            if (+x === +a && +y > +b) needUpdate = true
            if (+x === +a && +y === +b && +z > +c) needUpdate = true
        } else {
            needUpdate = true
        }

        if (needUpdate && link) {
            const filePath = path.join(app.getPath('userData'), `${uuidV4()}.exe`)
            popupHint(link, filePath)
        }
    } catch (err) {
        log.error(err)
    }
}

module.exports = {
    checkUpdatesAndNotify,
}
