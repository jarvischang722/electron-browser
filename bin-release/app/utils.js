require('date-utils')
const fs = require('fs')
const path = require('path')
const request = require('request')
const exec = require('child_process').execFile

const download = (link, dest, callback) => {
    const file = fs.createWriteStream(dest)
    request.get(link)
    .on('error', function(err) {
        return callback(err)
    })
    .pipe(file)
    file.on('finish', function() {
        file.close(callback)
    })

    file.on('error', function(err) {
        fs.unlink(dest)
        return callback(err)
    })
}

const runFirstTimeToday = () => {
    const infoFile = path.join(__dirname, '..', 'info.json')
    const fileExists = fs.existsSync(infoFile)
    let firstTimeToday = true
    const today = new Date().toFormat('YYYYMMDD')
    if (fileExists) {
        const text = fs.readFileSync(infoFile, 'utf8')
        if (text && JSON.parse(text).hasOwnProperty(today)) {
            firstTimeToday = false
        }
    }
    if (firstTimeToday) {
        const info = {}
        info[today] = 1
        fs.writeFileSync(infoFile, JSON.stringify(info))
    }
    return firstTimeToday
}

const autoUpdate = (app, platform) => {
    try {
        if (!platform || platform !== 'windows') return
        if (!runFirstTimeToday()) return
        let needUpdate = false
        let currentVer = app.getVersion()
        const { client } = require('./package.json')
        if (!client) return
        const apiMain = 'http://146.196.52.47:7002'
        const reqUrl = `${apiMain}/browser/version?platform=${platform}&client=${client}`
        request.get(reqUrl, (err, res, body) => {
            if (!err && body) {
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
                if (needUpdate) {
                    const filePath = path.join(__dirname, '..', 'install.exe')
                    download(link, filePath, (err) => {
                        if (!err) exec(filePath)
                    })
                }
            }
        })
    } catch(err) {
        return callback(err)
    }
}

module.exports = {
    autoUpdate,
}
