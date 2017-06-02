const path = require('path')
const electron = require('electron')
const fs = require('fs')

let loadedLanguage
const app = electron.app ? electron.app : electron.remote.app

function i18n() {
    let locale = app.getLocale()
    if (locale) {
        locale = locale.toLowerCase()
    }
    if (fs.existsSync(path.join(__dirname, '../lang', `${locale}.json`))) {
        loadedLanguage = require(`../lang/${locale}.json`)
    } else {
        loadedLanguage = require('../lang/en.json')
    }
}

/* eslint-disable no-underscore-dangle */
i18n.prototype.__ = (phrase) => {
    let translation = loadedLanguage[phrase]
    if (!translation) {
        translation = phrase
    }
    return translation
}

module.exports = i18n
