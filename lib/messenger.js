class Messenger {
  constructor (mhubClient, options) {
    this.client = mhubClient
    this.options = options
    this.Promise = this.options.promise

    this._handlingfilters = [(messege, topic) => messege.topic === topic]

    this._connectionPreactions = []
    this._listenPreactions = []
    this._sendPreactions = []

    this._connectionPostactions = []
    this._listenPostactions = []
    this._sendPostactions = []

    this._connectionErroractions = []
    this._sendErroractions = []

    this._headerProviders = []
  }

  listen (topic, callback) {
    this._listenPreactions.forEach(action => { action(topic, callback, this) })

    this._client.on('message', message => {
      if (this._shouldHandleMessageByTopic(message, topic)) {
        callback(message.data, message)
      }
    })

    let promise = this.connect()
      .then(() => this._client.subscribe(this.options.node, topic))

    this._listenPostactions.forEach(action => {
      promise = this._listenPostactions.then(result => action(result, topic, callback, this))
    })

    return promise
  }

  on (topic, callback) {
    return this.listen(topic, callback)
  }

  send (topic, data) {
    this._sendPreactions.forEach(action => { action(topic, data, this) })

    let promise = this.connect()
      .then(() => this.client.publish(this.options.node, topic, data, this._headers()))

    this._sendPostactions.forEach(action => {
      promise = this._sendPostactions.then(result => action(result, topic, data, this))
    })

    promise.catch(error => this._sendErroractions.forEach(action => action(error)))

    return promise
  }

  connect () {
    if (!this._connectionPromise) {
      this._sendPreactions.forEach(action => { action(this) })

      this._connectionPromise = this.Promise.resolve(this.client.connect())

      this._connectionPostactions.forEach(action => {
        this._connectionPromise = this._connectionPromise.then(result => action(result, this))
      })

      this._connectionPromise.catch(error => this._connectionErroractions.forEach(action => action(error)))
    }

    return this._connectionPromise
  }

  _headers () {
    return this._headerProviders.reduce((headers, headerProvider) => {
      Object.assign(headers, headerProvider())
      return headers
    }, { })
  }

  _shouldHandleMessage (message, topic) {
    return this._handlingfilters.reduce((shouldHandleMessege, filter) => {
      return shouldHandleMessege && filter(message, topic)
    }, true)
  }
}

exports.Messenger = Messenger
