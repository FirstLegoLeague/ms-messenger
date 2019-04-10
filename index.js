'use strict'
/* eslint node/no-unsupported-features: 0 */

const MHubClient = require('mhub').MClient
const { getCorrelationId } = require('@first-lego-league/ms-correlation')
const Promise = require('bluebird')

class Messenger {
  constructor (options = {}) {
    this.options = Object.assign({}, Messenger.DEFAULT_OPTIONS, options)

    this._logger = this.options.logger
    this._client = new MHubClient(this.options.mhubURI)
    this._topics = []

    this._client.on('error', msg => this._logger.error(`Unable to connect to mhub: ${msg}`))
    this._client.on('close', msg => {
      this._logger.error(`Disconnected from MHub: ${msg}`)
      this._setTimeoutToReconnect()
    })
  }

  listen (topic, callback) {
    this._client.on('message', message => {
      if (message.topic === topic) {
        callback(message.data, message)
      }
    })
    this._topics.push(topic)
    return this._connect()
      .then(() => this._client.subscribe(this.options.node, topic))
  }

  send (topic, data) {
    return this._connect()
      .then(() => this._client.publish(this.node, topic, data, {
        'client-id': this._clientId,
        'correlation-id': getCorrelationId()
      }))
  }

  _connect () {
    if (!this._connectionPromise) {
      this._logger.debug('Connecting to MHub')
      this._connectionPromise = this._client.connect()
        .then(() => this._logger.debug('Conneted to MHub'))

      if (this.options.credentials) {
        this._connectionPromise = this._connectionPromise
          .then(() => this._client.login(this.options.credentials.username, this.options.credentials.password))
          .then(() => this._logger.debug('Logged into MHub'))
      }

      this._connectionPromise = this._connectionPromise
        .catch(msg => {
          this._logger.error(`Could not connect to MHub ${msg}`)
          this._setTimeoutToReconnect()
        })
    }
    return this._connectionPromise
  }

  _setTimeoutToReconnect () {
    this._connectionPromise = undefined
    return new Promise(resolve => {
      setTimeout(() => this._connect().then(resolve), this.options.reconnectTimeout)
    })
  }
}

const DO_NOTHING = () => { }

Messenger.DEFAULT_OPTIONS = {
  mhubURI: process.env.MHUB_URI,
  node: 'default',
  clientId: getCorrelationId(),
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
