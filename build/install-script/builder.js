const builder = require('electron-builder')
const path = require('path')

module.exports = function (options, commonOpt, callback) {
    const builderConf = {
        extraMetadata: {
            name: `safety-browser-${options.client}-setup-${commonOpt.version}`,
            description: options.fileDescription,
            author: 'Tripleone',
        },
        config: {
            appId: options.clientId,
            buildVersion: options.version,
            copyright: `Copyright © ${new Date().getFullYear()} Tripleone`,
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

    // Mac OS conguration
    if (process.env.npm_config_platform === 'mac') {
        // builderConf.config.mac = {
        //    icon: `./src/clients/${options.client}/icon.ico`,
        //    artifactName: `safety-browser-${options.client}-setup-${commonOpt.version}.dmg`,
        // }
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
            console.log('Build successful.')
            callback()
        })
        .catch((error) => {
            console.log(error)
            callback(error)
        })
}
