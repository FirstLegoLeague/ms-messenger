'use strict'
/* eslint node/no-unsupported-features: 0 */

const DO_NOTHING = () => { }

const MHubClient = require('mhub').MClient
const { getCorrelationId } = require('@first-lego-league/ms-correlation')

const DEFAULT_OPTIONS = {
  reconnectTimeout: 10 * 1000, // 10 seconds
  mhubURI: process.env.MHUB_URI,
  node: 'default',
  clientId: getCorrelationId(),
  logger: {
    debug: DO_NOTHING,
    info: DO_NOTHING,
    warn: DO_NOTHING,
    error: DO_NOTHING,
    fatal: DO_NOTHING
  }
}

class Messenger {
  constructor (options = {}) {
    this.options = Object.assign(options, DEFAULT_OPTIONS)

    this.logger = this.options.logger
    this.client = new MHubClient(this.options.mhubURI)
    this.topics = []

    this.client.on('error', msg => this.logger.error(`Unable to connect to mhub: ${msg}`))
    this.client.on('close', msg => {
      this.logger.error(`Disconnected from MHub: ${msg}`)
      this._setTimeoutToReconnect()
    })
  }

  on (topic, callback) {
    const topicRegexp = new RegExp(topic)
    this.client.on('message', message => {
      if (topicRegexp.exec(message.topic) !== null) {
        callback(message.data, message)
      }
    })
    this.topics.push(topic)
    return this._connect()
      .then(() => this.client.subscribe(this.options.node, topic))
  }

  send (topic, data) {
    return this._connect()
      .then(() => this.client.publish(this.options.node, topic, data, {
        'client-id': this.options.clientId,
        'correlation-id': getCorrelationId()
      }))
  }

  _setTimeoutToReconnect () {
    this._connectionPromise = undefined
    setTimeout(() => this._connect(), this.options.reconnectTimeout)
  }

  _connect () {
    if (!this._connectionPromise) {
      this.logger.debug('Connecting to MHub...')

      this._connectionPromise = this.client.connect()
        .then(() => this.logger.debug('Conneted to MHub.'))

      if (this.options.credentials) {
        this._connectionPromise = this._connectionPromise
          .then(() => this.client.login(this.options.credentials.username, this.options.credentials.password))
          .then(() => this.logger.debug('Logged into MHub.'))
      }

      this._connectionPromise = this._connectionPromise
        .catch(msg => {
          this.logger.error(`Could not connect to MHub: ${msg}.`)
          this._setTimeoutToReconnect()
        })
    }
    return this._connectionPromise
  }
}

exports.Messenger = Messenger
