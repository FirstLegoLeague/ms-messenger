const { Logger } = require('@first-lego-league/ms-logger')

exports.logMessengerEvents = messenger => {
  messenger.logger = new Logger()

  messenger._connectionPreactions.push(() => messenger.logger.debug('Connecting to MHub'))
  messenger._connectionPostactions.push(() => messenger.logger.debug('Connected to MHub'))

  messenger.client.on('error', msg => messenger.logger.error(`Unable to connect to MHub: ${msg}`))
  messenger.client.on('close', msg => messenger.logger.error(`Disconnected from MHub: ${msg}`))
}
