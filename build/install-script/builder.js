const builder = require('electron-builder')
const path = require('path')
const commonOpt = require('../../src/app/config/common.json')
const fs = require('fs')
const log4js = require('log4js')
const pjson = require('../../package.json')

const logger = log4js.getLogger()

module.exports = (options, callback) => {
    try {
        const { client: clientNam } = options
        const clientPath = path.join(__dirname, '..', '..', 'src', 'clients', clientNam)
        const winIconPath = path.join(clientPath, 'icon.ico')
        let macIconPath = path.join(clientPath, 'icon.icns')
        const buildOfPlatform = options.platform || process.platform
        const supportArch = options.supportArch ? options.supportArch : [process.arch]
        const builderConf = {

            config: {
                appId: options.clientId,
                buildVersion: commonOpt.version,
                extraMetadata: {
                    name: clientNam,
                    description: options.fileDescription,
                    author: pjson.author,
                },
                electronVersion:
                pjson.devDependencies.electron.replace('^', ''),
                copyright: `Copyright © ${new Date().getFullYear()} ${pjson.author}`,
                artifactName: '${productName}.${ext}',
                directories: {
                    app: path.join(__dirname, '..', '..', 'src', 'app'),
                    output: path.join(__dirname, '..', '..', 'dist', clientNam),
                },
                files: [
                    `!tools/shadowsocks/${buildOfPlatform === 'win32' ? 'mac' : 'windows'}/*`,
                    '!tools/shadowsocks/mac/ShadowsocksX-NG.app/*',
                    '!tools/shadowsocks/windows/ss_win_temp/*',
                ],
            },
            x64: supportArch.includes('x64'),
            ia32: supportArch.includes('ia32'),
        }

         /** ************************
         ***  Windows conguration ***
         ************************* */
        if (buildOfPlatform === 'win32') {
            builderConf.config.win = {
                target: ['nsis'],
                icon: winIconPath,
                certificateFile: path.join(__dirname, 'smartbrowser.pfx'),
                certificatePassword: '12345678',
            }
            builderConf.config.nsis = {
                oneClick: false,
                perMachine: false,
                installerIcon: winIconPath,
                installerHeaderIcon: winIconPath,
                uninstallerIcon: winIconPath,
                allowToChangeInstallationDirectory: true,
                displayLanguageSelector: true,
                installerLanguages: ['en_US', 'zh_CN'],
                multiLanguageInstaller: true,
                createDesktopShortcut: true,
                shortcutName: options.productName,
            }
        }

        /** ************************
         ***  Mac OS conguration ***
         ************************* */
        if (['macOS', 'darwin'].indexOf(buildOfPlatform) > -1) {
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

         /** ************************
         ***  Linux conguration ***
         ************************* */
        if (buildOfPlatform === 'linux') {
            builderConf.config.linux = true
            builderConf.linux = {
                target: ['AppImage', 'deb'],
            }
        }

        builder
            .build(builderConf)
            .then(async () => {
                const ext = buildOfPlatform === 'win32' ? 'exe' : 'dmg'
                const filePath = `${__dirname}/../../dist/${clientNam}/${clientNam}.${ext}`
                const filename = `${clientNam}-setup-${commonOpt.version}.${ext}`
                const destPath = `${commonOpt.serviceHomeBase}/deploy/${filename}`
                fs.copyFileSync(filePath, destPath) // Copy file to service
                callback(null, filename)
            })
            .catch((err) => {
                logger.error(err)
                const errorIdx = err.message.indexOf('error:')
                const errorMsg = err.message.substring(errorIdx)
                callback(new Error(errorMsg))
            })
    } catch (error) {
        logger.error(error)
        callback(error)
    }
}
