exports.authenticateMesseger = messenger => {
  messenger._connectionPostactions.push(() => {
    return messenger.client.login(messenger.options.credentials.username, messenger.options.credentials.password)
  })

  if (messenger.logger) {
    messenger._connectionPostactions.push(() => {
      messenger.logger.debug('Logged into MHub')
    })
  }
}
