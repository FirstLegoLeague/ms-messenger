const { Messenger } = require('./messenger')
const { identifyMesseger } = require('./client_identity')
const { ignoreByTopic } = require('./ignoring')
const { keepAlive } = require('./stay_alive')
const { authenticateMesseger } = require('./authentication')

exports.createMessenger = (client, options) => {
  const messenger = new Messenger(client, options)

  identifyMesseger(messenger)
  ignoreByTopic(messenger)
  keepAlive(messenger)

  if (options.credentials) {
    authenticateMesseger(messenger)
  }

  return messenger
}
