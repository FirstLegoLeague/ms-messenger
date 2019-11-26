exports.keepAlive = messenger => {
  messenger._setTimeoutToReconnect = () => {
    messenger._connectionPromise = undefined
    return new messenger.Promise(resolve => {
      setTimeout(() => messenger.connect().then(resolve), messenger.options.reconnectTimeout)
    })
  }

  messenger.client.on('close', msg => messenger._setTimeoutToReconnect())

  messenger._topics = []
  messenger._listenPostactions.push(topic => messenger._topics.push(topic))
  messenger._connectionPostactions.push(() => {
    messenger._Promise.all(messenger._topics.map(topic => messenger.client.subscribe(messenger.options.node, topic)))
  })

  messenger._connectionErroractions.push(() => messenger._setTimeoutToReconnect())
}
