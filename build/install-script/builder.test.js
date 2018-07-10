const builder = require('electron-builder')
const path = require('path')
// const clientInfo = require('../../src/app/config/client.json')
// const commontOpt = require('../../src/app/config/common.json')

module.exports = function (options, commonOpt, callback) {
    const builderConf = {
        extraMetadata: {
            name: `safety-browser-${options.client}-setup-${commonOpt.version}`,
            description: options.fileDescription,
            license: '',
            author: 'Tripleone',
        },
        config: {
            appId: options.clientId,
            buildVersion: options.version,
            copyright: commonOpt.legalCopyright,
            // files: ['!plugins/*'],
            directories: {
                app: path.join(__dirname, '..', '..', 'src', 'app'),
                output: path.join(__dirname, '..', '..', 'dist', options.client),
            },
        },
    }
    if (process.env.npm_config_platform === 'win') {
        if (process.env.npm_config_arch === 'x64') {
            builderConf.config.x64 = true
        } else if (process.env.npm_config_arch === 'ia32') {
            builderConf.config.ia32 = true
        } else {
            builderConf.config.x64 = true
            builderConf.config.ia32 = true
        }

        builderConf.config.win = {
            target: ['nsis'],
            icon: `./src/clients/${options.client}/icon.ico`,
            certificateFile: './build/install-script/smartbrowser.pfx',
            certificatePassword: '12345678',
        }
        builderConf.config.nsis = {
            oneClick: false,
            perMachine: true,
            installerIcon: `./src/clients/${options.client}/icon.ico`,
            installerHeaderIcon: `./src/clients/${options.client}/icon.ico`,
            uninstallerIcon: `./src/clients/${options.client}/icon.ico`,
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

    if (process.env.npm_config_platform === 'mac') {
        builderConf.config.mac = {
            icon: `./src/clients/${options.client}/icon.ico`,
            artifactName: `safety-browser-${options.client}-setup-${commonOpt.version}.${process.env.ext}`,
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
            console.log('Build successful.')
            callback()
        })
        .catch((error) => {
            console.log(error)
            callback(error)
        })
}
