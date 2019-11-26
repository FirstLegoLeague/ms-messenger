const { getCorrelationId } = require('@first-lego-league/ms-correlation')

exports.correlateMesseger = messenger => {
  messenger._headersProviders.push(() => ({ 'correlation-id': getCorrelationId() }))
}
