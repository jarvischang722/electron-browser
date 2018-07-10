const builder = require('electron-builder')
const path = require('path')
// const clientInfo = require('../../src/app/config/client.json')
// const commontOpt = require('../../src/app/config/common.json')

module.exports = function (clientOpt, commonOpt, callback) {
    const builderConf = {
        extraMetadata: {
            name: `safety-browser-${clientOpt.client}-setup-${commonOpt.version}`,
            description: clientOpt.fileDescription,
            license: '',
            author: 'Tripleone',
        },
        // projectDir: '../src/app',
        // ia32: clientOpt.ia32 || false,
        x64: true,
        // mac: clientOpt.mac || false,
        // linux: clientOpt.linux || false,
        // mwl: clientOpt.mwl || false,
        config: {
            appId: clientOpt.clientId,
            buildVersion: clientOpt.version,
            copyright: commonOpt.legalCopyright,
            // files: ['!plugins/*'],
            directories: {
                app: path.join(__dirname, '..', '..', 'src', 'app'),
                output: path.join(__dirname, '..', '..', 'dist', clientOpt.client),
            },
            win: {
                target: ['nsis'],
                icon: `./src/clients/${clientOpt.client}/icon.ico`,
                certificateFile: './build/install-script/smartbrowser.pfx',
                certificatePassword: '12345678',
                // extraResources: './src/plugins/*.dll',
            },
            nsis: {
                oneClick: false,
                perMachine: true,
                installerIcon: `./src/clients/${clientOpt.client}/icon.ico`,
                installerHeaderIcon: `./src/clients/${clientOpt.client}/icon.ico`,
                uninstallerIcon: `./src/clients/${clientOpt.client}/icon.ico`,
                allowToChangeInstallationDirectory: true,
                displayLanguageSelector: true,
                installerLanguages: [
                    'en_US',
                    'zh_CN',
                ],
                multiLanguageInstaller: true,
                createDesktopShortcut: true,
            },
            // extraFiles: [{
            //     from: 'src/plugins',
            //     to: '../plugins',
            //     filter: ['**/*'],
            // }],
            dmg: {
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
            },
            linux: {
                target: [
                    'AppImage',
                    'deb',
                ],
            },
        },
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
