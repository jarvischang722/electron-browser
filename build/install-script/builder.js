const builder = require('electron-builder')
const path = require('path')
const commonOpt = require('../../src/app/config/common.json')
const request = require('request')
const fs = require('fs')

module.exports = (options, callback) => {
    try {
        const setupFileName = `safety-browser-${options.client}-setup-${commonOpt.version}`
        const iconPath = path.join(__dirname, '..', '..', 'src', 'clients', options.client, 'icon.ico')
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
                icon: iconPath,
                certificateFile: path.join(__dirname, 'smartbrowser.pfx'),
                certificatePassword: '12345678',
            }
            builderConf.config.nsis = {
                oneClick: false,
                perMachine: true,
                installerIcon: iconPath,
                installerHeaderIcon: iconPath,
                uninstallerIcon: iconPath,
                allowToChangeInstallationDirectory: true,
                displayLanguageSelector: true,
                installerLanguages: [
                    'en_US',
                    'zh_CN',
                ],
                multiLanguageInstaller: true,
                createDesktopShortcut: true,
            }
        }

        // Mac OS conguration
        if (buildOfPlatform === 'macOS' || buildOfPlatform === 'darwin') {
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
                target: [
                    'AppImage',
                    'deb',
                ],
            }
        }

        builder.build(builderConf)
            .then(() => {
                const ext = buildOfPlatform === 'win32' ? 'exe' : 'dmg'
                const filename = `${setupFileName}.${ext}`
                const formData = {
                    browserSetup: fs.createReadStream(`${__dirname}/../../dist/${options.client}/${filename}`),
                }
                request.post({ url: `${commonOpt.serviceAddr}/browser/uploadBrowserSetup`, formData }, (err, httpResponse, body) => {
                    if (err) {
                        return callback(err)
                    }
                    callback(null, filename)
                })
            })
    } catch (error) {
        callback(error)
    }
}
