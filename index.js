'use strict'
/* eslint node/no-unsupported-features: 0 */

const MHubClient = require('mhub').MClient
const { Logger } = require('@first-lego-league/ms-logger')
const { getCorrelationId } = require('@first-lego-league/ms-correlation')

const DEFAULT_OPTIONS = {
  reconnectTimeout: 10 * 1000, // 10 seconds
  mhubURI: process.env.MHUB_URI,
  node: 'default',
  clientId: getCorrelationId()
}

class Messenger {
  constructor (options) {
    this.options = Object.assign(options, DEFAULT_OPTIONS)

    this.logger = new Logger()
    this.client = new MHubClient(this.options.mhubURI)
    this.topics = []

    this.client.on('error', msg => this.logger.error(`Unable to connect to mhub: ${msg}`))
    this.client.on('close', msg => {
      this.logger.error(`Disconnected from MHub: ${msg}`)
      this._setTimeoutToReconnect()
    })
  }

  connect () {
    if (!this._connectionPromise) {
      this.logger.debug('Connecting to MHub')
      this._connectionPromise = this.client.connect()
        .then(() => this.logger.debug('Conneted to MHub'))

      if (this.options.credentials) {
        this._connectionPromise = this._connectionPromise
          .then(() => this.client.login(this.options.credentials.username, this.options.credentials.password))
          .then(() => this.logger.debug('Logged into MHub'))
      }

      this._connectionPromise = this._connectionPromise
        .catch(msg => {
          this.logger.error(`Could not connect to MHub ${msg}`)
          this._setTimeoutToReconnect()
        })
    }
    return this._connectionPromise
  }

  listen (topic, callback) {
    this.client.on('message', message => {
      if (message.topic === topic) {
        callback(message.data, message)
      }
    })
    this.topics.push(topic)
    return this.connect()
      .then(() => this.client.subscribe(this.options.node, topic))
  }

  send (topic, data) {
    return this.connect()
      .then(() => this.client.publish(this.node, topic, data, {
        'client-id': this.clientId,
        'correlation-id': getCorrelationId()
      }))
  }

  _setTimeoutToReconnect () {
    this._connectionPromise = undefined
    setTimeout(() => this.connect(), this.options.reconnectTimeout)
  }
}

exports.Messenger = Messenger
