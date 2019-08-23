/* eslint-disable node/exports-style */

if (typeof window === 'undefined') {
  module.exports = require('mhub/dist/src/nodeclient').MClient
} else {
  module.exports = require('mhub/dist/src/browserclient').MClient
}
