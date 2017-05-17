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

const autoUpdate = (app, platform, callback) => {
    if (!platform || platform !== 'windows') return callback()
    let needUpdate = false
    let currentVer = app.getVersion()
    const { client } = require('./package.json')
    if (!client) return callback()
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
                    exec(filePath, (err) => {
                        if (callback) return callback(err)
                    })
                })
            }
        }
    })
}

module.exports = {
    autoUpdate,
}
