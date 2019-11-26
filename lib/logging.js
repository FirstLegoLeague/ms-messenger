exports.logMessengerEvent = (messenger, logger) => {
  messenger.logger = logger

  messenger._connectionPreactions.push(() => logger.debug('Connecting to Mhub'))
  messenger._connectionPostactions.push(() => logger.debug('Connected to Mhub'))

  messenger.client.on('error', msg => logger.error(`Unable to connect to mhub: ${msg}`))
  messenger.client.on('close', msg => logger.error(`Disconnected from MHub: ${msg}`))
}
