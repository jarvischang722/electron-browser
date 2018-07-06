const builder = require('electron-builder')
const path = require('path')
const clientInfo = require('../../src/app/config/client.json')
const commontOpt = require('../../src/app/config/common.json')

module.exports = function (options, callback) {
    builder.build({
        extraMetadata: {
            name: clientInfo.productName,
            description: clientInfo.productName,
        },
        // projectDir: '../src/app',
        // ia32: options.ia32 || false,
        x64: options.x64 || true,
        // mac: options.mac || false,
        // linux: options.linux || false,
        // mwl: options.mwl || false,
        config: {
            appId: clientInfo.clientId,
            buildVersion: commontOpt.version,
            copyright: '',
            files: ['!plugins/*'],
            directories: {
                app: path.join(__dirname, '..', '..', 'src', 'app'),
                output: path.join(__dirname, '..', '..', 'dist', 'client'),
            },
            win: {
                target: ['nsis'],
                icon: './src/clients/tripleone/icon.ico',
                certificateFile: './build/install-script/smartbrowser.pfx',
                certificatePassword: '12345678',
                // extraResources: './src/plugins/*.dll',
            },
            nsis: {
                oneClick: false,
                perMachine: true,
                installerIcon: './src/clients/tripleone/icon.ico',
                installerHeaderIcon: './src/clients/tripleone/icon.ico',
                uninstallerIcon: './src/clients/tripleone/icon.ico',
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
    })
  .then(() => {
      console.log('Build successful.')
      callback()
  })
  .catch((error) => {
      console.log(error)
      callback(error)
  })
}
