const { MhubClient } = require('./lib/mhub_client')
const { getDefaultLogger } = require('./lib/default_logger')
const { headers } = require('./lib/headers')
const { getClientId } = require('./lib/identity')
const { ignoreNextMessageOfTopic, shouldIgnoreMessage } = require('./lib/ignoring')

class Messenger {
  constructor (options = {}) {
    this.options = Object.assign({}, Messenger.DEFAULT_OPTIONS, options)

    this.clienId = getClientId(this.options)
    this._client = new MhubClient(this.options.mhubURI)
    this._logger = this.options.logger
    this._Promise = this.options.promise

    this._topics = []

    this._client.on('error', msg => this._logger.error(`Unable to connect to mhub: ${msg}`))
    this._client.on('close', msg => {
      this._logger.error(`Disconnected from MHub: ${msg}`)
      this._setTimeoutToReconnect()
    })
  }

  listen (topic, callback) {
    this._client.on('message', message => {
      if (message.topic === topic && !shouldIgnoreMessage(message)) {
        callback(message.data, message)
      }
    })
    this._topics.push(topic)

    return this.connect()
      .then(() => this._client.subscribe(this.options.node, topic))
  }

  on (topic, callback) {
    return this.listen(topic, callback)
  }

  send (topic, data) {
    return this.connect()
      .then(() => this._client.publish(this.options.node, topic, data, headers(this)))
  }

  connect () {
    if (!this._connectionPromise) {
      this._logger.debug('Connecting to MHub')
      this._connectionPromise = this._Promise.resolve(this._client.connect())
        .then(() => this._logger.debug('Conneted to MHub'))

      if (this.options.credentials) {
        this._connectionPromise = this._connectionPromise
          .then(() => this._client.login(this.options.credentials.username, this.options.credentials.password))
          .then(() => this._logger.debug('Logged into MHub'))
      }

      if (this._topics.length) {
        this._connectionPromise = this._connectionPromise
          .then(() => this._Promise.all(this._topics.map(topic => this._client.subscribe(this.options.node, topic))))
      }

      this._connectionPromise = this._connectionPromise
        .catch(msg => {
          this._logger.error(`Could not connect to MHub ${msg}`)
          this._setTimeoutToReconnect()
        })
    }
    return this._connectionPromise
  }

  ignoreNextMessage (topic) {
    ignoreNextMessageOfTopic(topic)
  }

  _setTimeoutToReconnect () {
    this._connectionPromise = undefined
    return new this._Promise(resolve => {
      setTimeout(() => this.connect().then(resolve), this.options.reconnectTimeout)
    })
  }
}

Messenger.DEFAULT_OPTIONS = {
  mhubURI: process.env.MHUB_URI,
  node: 'default',
  clientId: 'unknown',
  reconnectTimeout: 10 * 1000, // 10 seconds
  logger: getDefaultLogger(),
  promise: global.Promise
}

exports.Messenger = Messenger
