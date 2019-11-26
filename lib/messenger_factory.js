const { Messenger } = require('./lib/messenger')
const { logMessengerEvent } = require('./lib/logging')
const { identifyMesseger } = require('./lib/client_identity')
const { ignoreByTopic } = require('./lib/ignoring')
const { keepAlive } = require('./lib/stay_alive')
const { authenticateMesseger } = require('./lib/authentication')

const DEFAULT_OPTIONS = {
  mhubURI: process.env.MHUB_URI,
  node: 'default',
  reconnectTimeout: 10 * 1000 // 10 seconds
}

exports.createMessenger = (client, options) => {
  options = Object.assign({ }, DEFAULT_OPTIONS, options)
  const messenger = new Messenger(client, options)

  if (options.logger) {
    logMessengerEvent(messenger, options.logger)
  }

  identifyMesseger(messenger)
  ignoreByTopic(messenger)
  keepAlive(messenger)

  if (options.credentials) {
    authenticateMesseger(messenger)
  }

  return messenger
}
