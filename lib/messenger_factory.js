const { Messenger } = require('./messenger')
const { logMessengerEvents } = require('./logging')
const { identifyMesseger } = require('./client_identity')
const { ignoreByTopic } = require('./ignoring')
const { keepAlive } = require('./stay_alive')
const { authenticateMesseger } = require('./authentication')

exports.createMessenger = (client, options) => {
  const messenger = new Messenger(client, options)

  if (options.logger) {
    logMessengerEvents(messenger, options.logger)
  }

  identifyMesseger(messenger)
  ignoreByTopic(messenger)
  keepAlive(messenger)

  if (options.credentials) {
    authenticateMesseger(messenger)
  }

  return messenger
}
