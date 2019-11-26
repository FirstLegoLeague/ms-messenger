const { MClient } = require('mhub/dist/src/nodeclient')

const { createMessenger } = require('./lib/messenger_factory')
const { correlateMesseger } = require('./lib/correlation')

exports.createMessenger = options => {
  const messenger = createMessenger(new MClient(options.mhubURI), options)

  correlateMesseger(messenger)

  return messenger
}
