

exports.__esModule = true
exports.usernamePasswordAuthetication = usernamePasswordAuthetication
exports.startServer = startServer

const _ip = require('ip')

const _net = require('net')

const _utils = require('./utils')

const _logger = require('./logger')

const _encryptor = require('./encryptor')

const _auth = require('./auth')

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj }
}

const NAME = 'ss_local'

let logger = void 0

function handleMethod(connection, data, authInfo) {
    // +----+----------+----------+
    // |VER | NMETHODS | METHODS  |
    // +----+----------+----------+
    // | 1  |    1     | 1 to 255 |
    // +----+----------+----------+
    const forceAuth = authInfo.forceAuth

    const buf = new Buffer(2)

    let method = -1

    if (forceAuth && data.indexOf(0x02, 2) >= 0) {
        method = 2
    }

    if (!forceAuth && data.indexOf(0x00, 2) >= 0) {
        method = 0
    }

    // allow `no authetication` or any usename/password
    if (method === -1) {
        // logger.warn(`unsupported method: ${data.toString('hex')}`);
        buf.writeUInt16BE(0x05ff)
        connection.write(buf)
        connection.end()
        return -1
    }

    buf.writeUInt16BE(0x0500)
    connection.write(buf)

    return method === 0 ? 1 : 3
}

function fetchUsernamePassword(data) {
    // suppose all VER is 0x01
    if (!(data instanceof Buffer)) {
        return null
    }

    const ulen = data[1]
    const username = data.slice(2, ulen + 2).toString('ascii')
    const plenStart = ulen + 2
    const plen = data[plenStart]
    const password = data.slice(plenStart + 1, plenStart + 1 + plen).toString('ascii')

    return { username, password }
}

function responseAuth(success, connection) {
    const buf = new Buffer(2)
    const toWrite = success ? 0x0100 : 0x0101
    const nextProcedure = success ? 2 : -1

    buf.writeUInt16BE(toWrite)
    connection.write(buf)
    connection.end()

    return nextProcedure
}

function usernamePasswordAuthetication(connection, data, authInfo) {
    // +----+------+----------+------+----------+
    // |VER | ULEN |  UNAME   | PLEN |  PASSWD  |
    // +----+------+----------+------+----------+
    // | 1  |  1   | 1 to 255 |  1   | 1 to 255 |
    // +----+------+----------+------+----------+

    const usernamePassword = fetchUsernamePassword(data)

    if (!usernamePassword) {
        return responseAuth(false, connection)
    }

    let username = usernamePassword.username,
        password = usernamePassword.password

    if (!(0, _auth.validate)(authInfo, username, password)) {
        return responseAuth(false, connection)
    }

    return responseAuth(true, connection)
}

function handleRequest(connection, data, _ref, dstInfo, onConnect, onDestroy, isClientConnected) {
    let serverAddr = _ref.serverAddr,
        serverPort = _ref.serverPort,
        password = _ref.password,
        method = _ref.method,
        localAddr = _ref.localAddr,
        localPort = _ref.localPort,
        localAddrIPv6 = _ref.localAddrIPv6

    const cmd = data[1]
    const clientOptions = {
        port: serverPort,
        host: serverAddr,
    }
    let repBuf = void 0
    let tmp = null
    let decipher = null
    let decipheredData = null
    let cipher = null
    let cipheredData = null

    if (cmd !== 0x01) {
        logger.warn(`unsupported cmd: ${cmd}`)
        return {
            stage: -1,
        }
    }

    // prepare data

    // +----+-----+-------+------+----------+----------+
    // |VER | REP |  RSV  | ATYP | BND.ADDR | BND.PORT |
    // +----+-----+-------+------+----------+----------+
    // | 1  |  1  | X'00' |  1   | Variable |    2     |
    // +----+-----+-------+------+----------+----------+

    logger.verbose(
        `connecting: ${dstInfo.dstAddr.toString('utf8')}:${dstInfo.dstPort.readUInt16BE()}`,
    )

    repBuf = new Buffer(10)
    repBuf.writeUInt32BE(0x05000001)
    repBuf.writeUInt32BE(0x00000000, 4, 4)
    repBuf.writeUInt16BE(0, 8, 2)

    tmp = (0, _encryptor.createCipher)(password, method, data.slice(3)) // skip VER, CMD, RSV
    cipher = tmp.cipher
    cipheredData = tmp.data

    // connect
    const clientToRemote = (0, _net.connect)(clientOptions, () => {
        onConnect()
    })

    clientToRemote.on('data', (remoteData) => {
        if (!decipher) {
            tmp = (0, _encryptor.createDecipher)(password, method, remoteData)
            if (!tmp) {
                logger.warn(`${NAME} get invalid msg`)
                onDestroy()
                return
            }
            decipher = tmp.decipher
            decipheredData = tmp.data
        } else {
            decipheredData = decipher.update(remoteData)
        }

        if (isClientConnected()) {
            (0, _utils.writeOrPause)(clientToRemote, connection, decipheredData)
        } else {
            clientToRemote.destroy()
        }
    })

    clientToRemote.on('drain', () => {
        connection.resume()
    })

    clientToRemote.on('end', () => {
        connection.end()
    })

    clientToRemote.on('error', (e) => {
        logger.warn(
            'ssLocal error happened in clientToRemote when' +
                ` connecting to ${(0, _utils.getDstStr)(dstInfo)}: ${e.message}`,
        )

        onDestroy()
    })

    clientToRemote.on('close', (e) => {
        if (e) {
            connection.destroy()
        } else {
            connection.end()
        }
    })

    // write
    connection.write(repBuf)

    ;(0, _utils.writeOrPause)(connection, clientToRemote, cipheredData)

    return {
        stage: 2,
        cipher,
        clientToRemote,
    }
}

function handleConnection(config, connection) {
    const authInfo = config.authInfo

    let stage = 0
    let clientToRemote = void 0
    let tmp = void 0
    let cipher = void 0
    let dstInfo = void 0
    let remoteConnected = false
    let clientConnected = true
    let timer = null

    connection.on('data', (data) => {
        switch (stage) {
        case 0:
            stage = handleMethod(connection, data, authInfo)

            break
        case 1:
            dstInfo = (0, _utils.getDstInfo)(data)

            if (!dstInfo) {
                logger.warn(`Failed to get 'dstInfo' from parsing data: ${data}`)
                connection.destroy()
                return
            }

            tmp = handleRequest(
                    connection,
                    data,
                    config,
                    dstInfo,
                    () => {
                        // after connected
                        remoteConnected = true
                    },
                    () => {
                        // get invalid msg or err happened
                        if (remoteConnected) {
                            remoteConnected = false
                            clientToRemote.destroy()
                        }

                        if (clientConnected) {
                            clientConnected = false
                            connection.destroy()
                        }
                    },
                    () => clientConnected,
                )

            stage = tmp.stage

            if (stage === 2) {
                clientToRemote = tmp.clientToRemote
                cipher = tmp.cipher
            } else {
                    // udp relay
                clientConnected = false
                connection.end()
            }

            break
        case 2:
            tmp = cipher.update(data)

                ;(0, _utils.writeOrPause)(connection, clientToRemote, tmp)

            break
        case 3:
                // rfc 1929 username/password authetication
            stage = usernamePasswordAuthetication(connection, data, authInfo)
            break
        default:

        }
    })

    connection.on('drain', () => {
        if (remoteConnected) {
            clientToRemote.resume()
        }
    })

    connection.on('end', () => {
        clientConnected = false
        if (remoteConnected) {
            clientToRemote.end()
        }
    })

    connection.on('close', (e) => {
        if (timer) {
            clearTimeout(timer)
        }

        clientConnected = false

        if (remoteConnected) {
            if (e) {
                clientToRemote.destroy()
            } else {
                clientToRemote.end()
            }
        }
    })

    connection.on('error', (e) => {
        logger.warn(`${NAME} error happened in client connection: ${e.message}`)
    })

    timer = setTimeout(() => {
        if (clientConnected) {
            connection.destroy()
        }

        if (remoteConnected) {
            clientToRemote.destroy()
        }
    }, config.timeout * 1000)
}

function closeAll() {
    (0, _utils.closeSilently)(this.server)
    if (this.httpProxyServer) {
        this.httpProxyServer.close()
    }
}

function createServer(config) {
    const server = (0, _net.createServer)(handleConnection.bind(null, config))

    server.on('close', () => {
        logger.warn(`${NAME} server closed`)
    })

    server.on('error', (e) => {
        logger.error(`${NAME} server error: ${e.message}`)
    })

    server.listen(config.localPort)

    logger.verbose(`${NAME} is listening on ${config.localAddr}:${config.localPort}`)

    return {
        server,
        closeAll,
    }
}

// eslint-disable-next-line
function startServer(config) {
    const willLogToConsole = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false

    logger =
        logger || (0, _logger.createLogger)(config.level, _logger.LOG_NAMES.LOCAL, willLogToConsole)

    // logger.error('test error log');

    let _createAuthInfo = (0, _auth.createAuthInfo)(config),
        info = _createAuthInfo.info,
        warn = _createAuthInfo.warn,
        error = _createAuthInfo.error

    if (error) {
        logger.error(`${NAME} error: ${error}`)
        return null
    }

    if (warn) {
        logger.warn(`${NAME}: ${warn}`)
    }

    return createServer(
        Object.assign({}, config, {
            authInfo: info,
        }),
    )
}

if (module === require.main) {
    process.on('message', (config) => {
        logger = (0, _logger.createLogger)(config.level, _logger.LOG_NAMES.LOCAL, false)
        startServer(config, false)
    })

    process.on('uncaughtException', (err) => {
        logger.error(
            `${NAME} uncaughtException: ${err.stack} `,
            (0, _utils.createSafeAfterHandler)(logger, () => {
                process.exit(1)
            }),
        )
    })
}
