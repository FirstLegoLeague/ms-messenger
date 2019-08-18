const { generateCorrelationId } = require('@first-lego-league/ms-correlation/lib/correlation-id')

class Messenger {
  constructor (options = {}) {
    this._Promise = options.promise || global.Promise
    this.options = Object.assign({}, Messenger.DEFAULT_OPTIONS, options)

    this._logger = this.options.logger
    const inBrowser = (typeof window === 'undefined')
    // eslint-disable-next-line import/no-dynamic-require
    const ClientClass = require(inBrowser ? 'mhub/dist/src/browserclient' : 'mhub/dist/src/nodeclient')
    this._client = new ClientClass(this.options.mhubURI)
    this._topics = []
    this._topicsToIgnore = []

    this._client.on('error', msg => this._logger.error(`Unable to connect to mhub: ${msg}`))
    this._client.on('close', msg => {
      this._logger.error(`Disconnected from MHub: ${msg}`)
      this._setTimeoutToReconnect()
    })
  }

  listen (topic, callback) {
    this._client.on('message', message => {
      if (message.topic === topic) {
        if (this._topicsToIgnore.includes(topic)) {
          this._topicsToIgnore = this._topicsToIgnore.filter(t => t !== topic)
        } else {
          callback(message.data, message)
        }
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
      .then(() => this._client.publish(this.node, topic, data, {
        'client-id': this._clientId,
        'correlation-id': generateCorrelationId()
      }))
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
          .then(() => this._Promise.all(this._topics.map(topic => this._client.subscribe(this.node, topic))))
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
    this._topicsToIgnore.push(topic)
  }

  _setTimeoutToReconnect () {
    this._connectionPromise = undefined
    return new this._Promise(resolve => {
      setTimeout(() => this.connect().then(resolve), this.options.reconnectTimeout)
    })
  }
}

const DO_NOTHING = () => { }

Messenger.DEFAULT_OPTIONS = {
  mhubURI: process.env.MHUB_URI,
  node: 'default',
  clientId: generateCorrelationId(),
  reconnectTimeout: 10 * 1000, // 10 seconds
  logger: {
    debug: DO_NOTHING,
    info: DO_NOTHING,
    warn: DO_NOTHING,
    error: DO_NOTHING,
    fatal: DO_NOTHING
  }
}

exports.Messenger = Messenger
