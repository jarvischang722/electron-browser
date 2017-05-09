const path = require("path")
const { app, BrowserWindow, ipcMain } = require('electron')
const { enabled_flash, enabled_proxy, proxyOptions, homeUrl } = require('./lib/client.json')
const cookieAuth = require('./lib/cookie-auth')

const ssLocal = require('./lib/ssLocal')

//console.log('start ss local');
const sslocalServer = ssLocal.startServer(proxyOptions, true)

//console.log(app.getLocale())

global.sharedObj = { homeUrl }

let pluginName
//console.log(process.platform);
switch (process.platform) {
    case 'win32':
        pluginName = 'pepflashplayer32_24_0_0_221.dll'
        break
    case 'darwin':
        pluginName = 'PepperFlashPlayer.plugin'
        break
    case 'linux':
        pluginName = 'libpepflashplayer.so'
        break
}
let flash_path = path.join(__dirname, pluginName) //'file://'+__dirname+'/'+pluginName;

if (enabled_flash) {
    // console.log(flash_path);
    app.commandLine.appendSwitch('ppapi-flash-path', flash_path)
    //app.commandLine.appendSwitch('ppapi-flash-path', "C:\\Windows\\SysWOW64\\Macromed\\Flash\\pepflashplayer32_24_0_0_221.dll")
    app.commandLine.appendSwitch('ppapi-flash-version', '24.0.0.221')
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false,
            webSecurity: false,
            allowRunningInsecureContent: false,
            plugins: true
        }
    })

    // and load the index.html of the app.
    // win.loadURL(`file://${__dirname}/index.html`);
    // win.loadURL('http://www.adobe.com/software/flash/about/');
    // Open the DevTools.
    // win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null
    })

    require('./mainmenu')

    if (enabled_proxy) {
        win.webContents.session.setProxy({ pacScript: `file://${__dirname}/default.pac` }, function () {
            win.loadURL(homeUrl)
            // win.loadURL('file://' + __dirname + '/html_src/home.html');
        })
    } else {
        win.loadURL(homeUrl)
    }

    win.maximize()

    // if (process.platform === 'win32') {
    //     var counter = 0;
    //     // every 1 second, increment the progress bar value
    //     var progress = setInterval(function () {
    //         if (counter < 1) {
    //             win.setProgressBar(counter);
    //             counter += .1;
    //         }
    //         else {
    //             win.setProgressBar(0);
    //             clearInterval(progress);
    //         }
    //     }, 1000);
    // }

    // app.getLocale()

    //win.openDevTools();

}

function createWindow2() {
    const Config = {

    }
	let appUrl = 'https://tripleonetech.net';
	let lastLocation = ''
	if ( lastLocation ) {
		appUrl += lastLocation;
	}

    win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            allowRunningInsecureContent: false,
            plugins: true
        }
    })

	cookieAuth( win, function() {
		win.webContents.send( 'cookie-auth-complete' );
	} );

	win.webContents.on( 'did-finish-load', function() {
		win.webContents.send( 'app-config', Config, true, {} );

		ipcMain.on( 'mce-contextmenu', function( ev ) {
			win.send( 'mce-contextmenu', ev );
		});

	} );

	win.webContents.session.webRequest.onBeforeRequest( function( details, callback ) {
		if ( details.resourceType === 'script' && details.url.startsWith( 'http://' ) && ! details.url.startsWith( Config.server_url + ':' + Config.server_port + '/' ) ) {
			callback( { redirectURL: details.url.replace( 'http', 'https' ) } );
		} else {
			callback( {} );
		}
	} );

	// win.loadURL( appUrl );
    win.loadURL(`file://${__dirname}/index.html`)
	//win.openDevTools();
    win.show()

	win.on( 'closed', function() {
		win = null
	})
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow2)

app.on('login', (event, webContents, request, authInfo, callback) => {
  event.preventDefault()
  console.log('xxxxxxxxxxxxxxxxxxxx');
  callback('username', 'secret')
})


// Quit when all windows are closed.
app.on('window-all-closed', () => {
    app.quit()
})

app.on('quit', () => {
    //close all
    //console.log('close ss local');
    sslocalServer.closeAll()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.