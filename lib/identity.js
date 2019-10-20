const randomize = require('randomatic')

function generateRandomClientId () {
  return randomize('Aa0?', 16, { chars: '+/' })
}

exports.getClientId = (options = { }) => {
  return options.clientId || generateRandomClientId()
}
