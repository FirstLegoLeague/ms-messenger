const Promise = require('bluebird')
const { MClient } = require('mhub/dist/src/browserclient')

const { createMessenger } = require('./lib/messenger_factory')

const DEFAULT_OPTIONS = {
  mhubURI: window.mhubURI,
  node: 'default',
  promise: Promise,
  reconnectTimeout: 10 * 1000 // 10 seconds
}

exports.createMessenger = options => {
  options = Object.assign({ }, DEFAULT_OPTIONS, options)
  return createMessenger(new MClient(options.mhubURI), options)
}
