const log = require('electron-log')
const fs = require('fs')
const path = require('path')

const debug = /--debug/.test(process.argv[2])

const initLogger = (app) => {
    const level = debug ? 'debug' : 'error'
    /**
     *  electron-log supports the following log levels:
     *  error >  warn > info > verbose > debug > silly
     */
    log.transports.file.appName = app.getName()

    /** *********** Console Tansport ************ */
    log.transports.console.level = level

    /**
     * Set output format template. Available variables:
     * Main: {level}, {text}
     * Date: {y},{m},{d},{h},{i},{s},{ms},{z}
     */
    log.transports.console.format = '[{y}/{m}/{d} {h}:{i}:{s}][{level}] {text}'

    // Set a function which formats output
    // log.transports.console.format = msg => util.format(...msg.data)

    /** *********** File Tansport ************ */
    // Same as for console transport
    log.transports.file.level = level
    log.transports.file.format = '[{y}/{m}/{d} {h}:{i}:{s}][{level}] {text}'

    // Set approximate maximum log size in bytes. When it exceeds,
    // the archived log will be saved as the log.old.log file
    log.transports.file.maxSize = 10 * 1024 * 1024

    // Write to this file, must be set before first logging
    const logPath = path.join(app.getPath('userData'), 'logs')

    if (!fs.existsSync(logPath)) fs.mkdirSync(logPath)

    log.transports.file.file = path.join(logPath, `${new Date().toFormat('YYYYMMDD')}.log`)

    // fs.createWriteStream options, must be set before first logging
    // you can find more information at
    // https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options
    log.transports.file.streamConfig = { flags: 'a' }

    // set existed file stream
    // log.transports.file.stream = fs.createWriteStream(`${new Date().toFormat('YYYYMMDD')}.log`)

    global.log = log
}

module.exports = {
    initLogger,
}
