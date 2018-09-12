const builder = require('electron-builder')
const path = require('path')
const commonOpt = require('../../src/app/config/common.json')
const request = require('request')
const fs = require('fs')
const log4js = require('log4js')

const logger = log4js.getLogger()

module.exports = (options, callback) => {
    try {
        const setupFileName = `safety-browser-${options.client}-setup-${commonOpt.version}`
        const clientPath = path.join(__dirname, '..', '..', 'src', 'clients', options.client)
        const winIconPath = path.join(clientPath, 'icon.ico')
        let macIconPath = path.join(clientPath, 'icon.icns')
        const builderConf = {
            extraMetadata: {
                name: setupFileName,
                description: options.fileDescription,
                author: 'Tripleone',
            },
            config: {
                appId: options.clientId,
                buildVersion: commonOpt.version,
                copyright: `Copyright © ${new Date().getFullYear()} Tripleone`,
                artifactName: '${productName}.${ext}',
                directories: {
                    app: path.join(__dirname, '..', '..', 'src', 'app'),
                    output: path.join(__dirname, '..', '..', 'dist', options.client),
                },
            },
        }

        const buildOfPlatform = options.platform || process.platform
        const supportArch = options.supportArch ? options.supportArch : [process.arch]

        builderConf.x64 = supportArch.includes('x64')
        builderConf.ia32 = supportArch.includes('ia32')

        // Windows conguration
        if (buildOfPlatform === 'win32') {
            builderConf.config.win = {
                target: ['nsis'],
                icon: winIconPath,
                certificateFile: path.join(__dirname, 'smartbrowser.pfx'),
                certificatePassword: '12345678',
            }
            builderConf.config.nsis = {
                oneClick: false,
                perMachine: true,
                installerIcon: winIconPath,
                installerHeaderIcon: winIconPath,
                uninstallerIcon: winIconPath,
                allowToChangeInstallationDirectory: true,
                displayLanguageSelector: true,
                installerLanguages: ['en_US', 'zh_CN'],
                multiLanguageInstaller: true,
                createDesktopShortcut: true,
            }
        }

        // Mac OS conguration
        if (buildOfPlatform === 'macOS' || buildOfPlatform === 'darwin') {
            if (!fs.existsSync(macIconPath)) {
                macIconPath = path.join(clientPath, 'icon.png')
            }
            builderConf.config.mac = {
                icon: macIconPath,
                identity: path.join(__dirname, 'smartbrowser.pfx'),
            }
            builderConf.config.dmg = {
                contents: [
                    {
                        x: 110,
                        y: 150,
                    },
                    {
                        x: 240,
                        y: 150,
                        type: 'link',
                        path: '/Applications',
                    },
                ],
            }
        }

        // Linux conguration
        if (buildOfPlatform === 'linux') {
            builderConf.config.linux = true
            builderConf.linux = {
                target: ['AppImage', 'deb'],
            }
        }

        builder.build(builderConf).then(async () => {
            const ext = buildOfPlatform === 'win32' ? 'exe' : 'dmg'
            const filename = `${setupFileName}.${ext}`
            if (options.uploadToSrv) {
                logger.info(`Start Upload '${filename}' to server. (${commonOpt.serviceAddr})`)
                const filePath = `${__dirname}/../../dist/${options.client}/${filename}`
                await uploadSetup(filePath)
                logger.info('File Uploaded.')
            }
            callback(null, filename)
        })
    } catch (error) {
        logger.error(error)
        callback(error)
    }
}

/**
 * Upload file to server
 */
async function uploadSetup(filePath) {
    const url = `${commonOpt.serviceAddr}/browser/uploadBrowserSetup`
    const formData = {
        browserSetup: fs.createReadStream(filePath),
    }
    return new Promise((resolve, reject) => {
        request.post({ url, formData, json: true }, (err, res, body) => {
            if (!err && body && body.success) {
                resolve()
            } else {
                logger.error('Upload setup file failed.')
                logger.error(err)
                reject(err)
            }
        })
    })
}
