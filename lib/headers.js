const isServer = require('detect-node')

if (isServer) {
  const { getCorrelationId } = require('@first-lego-league/ms-correlation')

  exports.headers = client => {
    const headers = { 'client-id': client.clientId, 'correlation-id': getCorrelationId() }
    return headers
  }
} else {
  exports.headers = client => {
    const headers = { 'client-id': client.clientId }
    return headers
  }
}
