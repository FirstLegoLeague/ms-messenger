const Promise = require('bluebird')
const { MClient } = require('mhub/dist/src/nodeclient')

const { createMessenger } = require('./lib/messenger_factory')
const { correlateMesseger } = require('./lib/correlation')
const { logMessengerEvents } = require('./lib/logging')

const DEFAULT_OPTIONS = {
  mhubURI: process.env.MHUB_URI,
  node: 'default',
  promise: Promise,
  reconnectTimeout: 10 * 1000 // 10 seconds
}

exports.createMessenger = options => {
  options = Object.assign({ }, DEFAULT_OPTIONS, options)
  const messenger = createMessenger(new MClient(options.mhubURI), options)

  correlateMesseger(messenger)
  logMessengerEvents(messenger)

  return messenger
}
