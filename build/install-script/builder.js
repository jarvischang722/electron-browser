const builder = require('electron-builder')
const path = require('path')
const commonOpt = require('../../src/app/config/common.json')
const request = require('request')
const fs = require('fs')

module.exports = (options, callback) => {
    const setupFileName = `safety-browser-${options.client}-setup-${commonOpt.version}`
    const builderConf = {
        extraMetadata: {
            name: setupFileName,
            description: options.fileDescription,
            author: 'Tripleone',
        },
        config: {
            appId: options.clientId,
            buildVersion: options.version,
            copyright: `Copyright © ${new Date().getFullYear()} Tripleone`,
            artifactName: '${productName}.${ext}',
            directories: {
                app: path.join(__dirname, '..', '..', 'src', 'app'),
                output: path.join(__dirname, '..', '..', 'dist', options.client),
            },
        },
    }

    if (!process.env.npm_config_platform) process.env.npm_config_platform = 'win'

    if (!process.env.npm_config_arch || process.env.npm_config_arch === 'x64') builderConf.x64 = true
    else builderConf.ia32 = true

    // Windows conguration
    if (process.env.npm_config_platform === 'win') {
        builderConf.config.win = {
            target: ['nsis'],
            icon: path.join(__dirname, '..', '..', 'src', 'clients', options.client, 'icon.ico'),
            certificateFile: path.join(__dirname, 'smartbrowser.pfx'),
            certificatePassword: '12345678',
        }
        builderConf.config.nsis = {
            oneClick: false,
            perMachine: true,
            installerIcon: path.join(__dirname, '..', '..', 'src', 'clients', options.client, 'icon.ico'),
            installerHeaderIcon: path.join(__dirname, '..', '..', 'src', 'clients', options.client, 'icon.ico'),
            uninstallerIcon: path.join(__dirname, '..', '..', 'src', 'clients', options.client, 'icon.ico'),
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
    if (process.env.npm_config_platform === 'mac') {
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
    if (process.env.npm_config_platform === 'linux') {
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
            const ext = process.env.npm_config_platform === 'mac' ? 'dmg' : 'exe'
            const filename = `${setupFileName}.${ext}`
            const formData = {
                filename: fs.createReadStream(`${__dirname}/../../dist/${options.client}/${filename}`),
            }
            request.post({ url: `${commonOpt.serviceAddr}/browser/uploadSetup`, formData }, (err, httpResponse, body) => {
                if (err) {
                    return callback(err)
                }
                callback(null, filename)
            })
        })
        .catch((error) => {
            callback(error)
        })
}
