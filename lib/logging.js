exports.logMessengerEvents = (messenger, logger) => {
  messenger.logger = logger

  messenger._connectionPreactions.push(() => logger.debug('Connecting to MHub'))
  messenger._connectionPostactions.push(() => logger.debug('Connected to MHub'))

  messenger.client.on('error', msg => logger.error(`Unable to connect to MHub: ${msg}`))
  messenger.client.on('close', msg => logger.error(`Disconnected from MHub: ${msg}`))
}
