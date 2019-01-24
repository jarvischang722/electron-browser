const remote = require('electron').remote
const ipcRenderer = require('electron').ipcRenderer
const { Menu, MenuItem } = remote

onload = () => {
    const webview = document.querySelector('webview')
    const homeUrl = remote.getGlobal('homeUrl')
    const browserId = remote.getCurrentWindow().id

    if (remote.getGlobal('isNewWindow')) {
        document.getElementById('web-view').src = remote.getGlobal('newWinUrl')
    } else {
        document.getElementById('web-view').src = homeUrl
    }

    const menu = new Menu()
    let nextIdx
    let x

    webview.addEventListener('dom-ready', () => {
        x = webview.getWebContents().history
    })

    menu.append(new MenuItem({ label: 'Go back',
        click: () => {
            const currIdx = webview.getWebContents().getActiveIndex()

            if (currIdx - 1 < 0) {
                nextIdx = currIdx
            } else {
                nextIdx = currIdx - 1
            }

            webview.goBack()
            ipcRenderer.send('set-current-url', x[nextIdx], browserId)
        } }))
    menu.append(new MenuItem({ label: 'Forward',
        click: () => {
            const currIdx = webview.getWebContents().getActiveIndex()

            if (currIdx + 1 > x.length - 1) {
                nextIdx = currIdx
            } else {
                nextIdx = currIdx + 1
            }

            webview.goForward()
            ipcRenderer.send('set-current-url', x[nextIdx], browserId)
        } }))
    menu.append(new MenuItem({ label: 'Reload',
        click: () => {
            webview.reload()
        } }))
    menu.append(new MenuItem({ label: 'Clean And Reload',
        click: () => {
            webview.reloadIgnoringCache()
        } }))
    menu.append(new MenuItem({ type: 'separator' }))
    menu.append(new MenuItem({ label: 'Select all', role: 'selectall' }))
    menu.append(new MenuItem({ label: 'Copy', role: 'copy' }))
    menu.append(new MenuItem({ label: 'Cut', role: 'cut' }))
    menu.append(new MenuItem({ label: 'Paste', role: 'paste' }))

    window.addEventListener('contextmenu', (e) => {
        e.preventDefault()
        menu.popup(remote.getCurrentWindow())
    }, false)

    webview.addEventListener('new-window', (e) => {
        window.open(e.url)
    })

    webview.addEventListener('will-navigate', (e) => {
        if (e.url.includes('deposit/auto_payment') || e.url.includes('player_center/auto_payment')) {

        } else {
            ipcRenderer.send('set-current-url', e.url, browserId)
        }
    })

    ipcRenderer.on('go-back-menu', () => {
        const currIdx = webview.getWebContents().getActiveIndex()

        if (currIdx - 1 < 0) {
            nextIdx = currIdx
        } else {
            nextIdx = currIdx - 1
        }

        webview.goBack()
        ipcRenderer.send('set-current-url', x[nextIdx], browserId)
    })

    ipcRenderer.on('go-forward-menu', () => {
        const currIdx = webview.getWebContents().getActiveIndex()

        if (currIdx + 1 > x.length - 1) {
            nextIdx = currIdx
        } else {
            nextIdx = currIdx + 1
        }

        webview.goForward()
        ipcRenderer.send('set-current-url', x[nextIdx], browserId)
    })

    ipcRenderer.on('reload-menu', () => {
        webview.reload()
    })

    ipcRenderer.on('force-reload-menu', () => {
        webview.reloadIgnoringCache()
    })
}
