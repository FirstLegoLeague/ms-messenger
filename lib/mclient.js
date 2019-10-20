/* eslint-disable node/exports-style */
const isServer = require('detect-node')

if (isServer) {
  module.exports = require('mhub/dist/src/nodeclient').MClient
} else {
  module.exports = require('mhub/dist/src/browserclient').MClient
}
