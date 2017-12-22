const builder = require('electron-builder')
const clientInfo = require('../../src/app/config/client.json')
const commontOpt = require('../../src/app/config/common.json')

builder.build({
    extraMetadata: {
        name: clientInfo.productName,
        description: clientInfo.productName,
    },
    config: {
        appId: clientInfo.clientId,
        buildVersion: commontOpt.version,
        copyright: '',
        directories: {
            app: './src/app/',
            output: './dist/client',
        },
        win: {
            target: ['nsis'],
            icon: './src/clients/tripleone/icon.ico',
            certificateFile: './build/install-script/smartbrowser.pfx',
            certificatePassword: '12345678',
            extraResources: './src/plugins/*.dll',
        },
        nsis: {
            oneClick: false,
            perMachine: true,
            installerIcon: './src/clients/tripleone/icon.ico',
            installerHeaderIcon: './src/clients/tripleone/icon.ico',
            uninstallerIcon: './src/clients/tripleone/icon.ico',
        },
        extraFiles: [{
            from: 'src/plugins',
            to: 'plugins',
            filter: ['**/*'],
        }],
    },
})
  .then(() => {
      console.log('Build successful.')
  })
  .catch((error) => {
      console.log(error)
  })

// if (process.platform === 'win32') {

// } else if (process.platform === 'darwin') {

// } else {

// }
// builder.build({
//    extraMetadata: {
//        name: clientInfo.productName,
//        description: clientInfo.productName,
//    },
//   config: {
//     appId: clientInfo.clientId,
//     directories: {
//       app: './src/app/'
//     },
//     mac: 'dmg',
//     icon: './src/clients/tripleone/icons.icns',
//   }
// })
//   .then(() => {
//       console.log('OK')
//   })
//   .catch((error) => {
//       console.log(error)
//   })


/*
formerly in package.json
"directories": {
    "doc": "doc"
  },
*/
