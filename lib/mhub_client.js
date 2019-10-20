const isServer = require('detect-node')

if (isServer) {
  exports.MhubClient = require('mhub/dist/src/nodeclient').MClient
} else {
  exports.MhubClient = require('mhub/dist/src/browserclient').MClient
}
