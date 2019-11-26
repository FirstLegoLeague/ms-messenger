const { MClient } = require('mhub/dist/src/browserclient')

const { createMessenger } = require('./lib/messenger_factory')

exports.createMessenger = options => {
  const messenger = createMessenger(new MClient(options.mhubURI), options)

  return messenger
}
