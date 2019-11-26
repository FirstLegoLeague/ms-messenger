const randomize = require('randomatic')

function generateRandomClientId () {
  return randomize('Aa0?', 16, { chars: '+/' })
}

exports.identifyMesseger = messenger => {
  messenger.clientId = messenger.options.clientId || generateRandomClientId()
  messenger._headersProviders.push(() => ({ 'client-id': messenger.clientId }))
}
