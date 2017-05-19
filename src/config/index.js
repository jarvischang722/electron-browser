
module.exports = (client) => {
    if (!client) client = 'tripleone'
    return require(`./clients/${client}/package.json`) 
}