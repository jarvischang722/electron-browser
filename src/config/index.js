
module.exports = (client) => {
    if (!client) client = 'tripleone'
    const config = require(`./clients/${client}/package.json`)
    config.icon = `src/config/clients/${client}/icon.ico`
    return config
}