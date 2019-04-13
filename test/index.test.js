'use strict'
/* global describe it beforeEach */
/* eslint promise/no-callback-in-promise: 0 */

const chai = require('chai')
const proxyquire = require('proxyquire')
const Promise = require('bluebird')

const { MHubMock, mclient } = require('./mocks/mhub.mock')
const { MSCorrelationMock } = require('./mocks/ms-correlation.mock')

const { Messenger } = proxyquire('../', { mhub: MHubMock, '@first-lego-league/ms-correlation': MSCorrelationMock })

const expect = chai.expect

describe('ms-messenger', () => {
  const loggerSandbox = chai.spy.sandbox()
  loggerSandbox.on(Messenger.DEFAULT_OPTIONS.logger, ['error', 'debug'])

  describe('with no options', () => {
    let messenger
    let messengerSandbox

    beforeEach(() => {
      messenger = new Messenger()
    })

    describe('constructor', () => {
      beforeEach(() => {
        messenger._setTimeoutToReconnect = () => { }
        messengerSandbox = chai.spy.sandbox()
        messengerSandbox.on(messenger, ['_setTimeoutToReconnect'])
      })

      it('creates a Mhub client', () => {
        expect(messenger._client).to.eq(mclient)
      })

      it('has the defulat options', () => {
        expect(messenger.options).to.deep.equal(Messenger.DEFAULT_OPTIONS)
      })

      it('attaches a listener on the client `error` event that calls the logger', () => {
        expect(mclient.on).to.have.been.called.with('error')
        mclient.emit('error')
        expect(messenger._logger.error).to.have.been.called()
      })

      it('attaches a listener on the client `close` event that calls the logger and _setTimeoutToReconnect', () => {
        expect(mclient.on).to.have.been.called.with('close')
        mclient.emit('close')
        expect(messenger._logger.error).to.have.been.called()
        expect(messenger._setTimeoutToReconnect).to.have.been.called()
      })
    })

    describe('listen', () => {
      const topic = 'topic'
      const anotherTopic = 'another topic'
      const callback = chai.spy()

      beforeEach(() => {
        messenger.connect = () => Promise.resolve()
        messengerSandbox = chai.spy.sandbox()
        messengerSandbox.on(messenger, ['connect'])
      })

      it('attaches a listen on the client `message` event that calls the callback only if the topic fits', () => {
        return messenger.listen(topic, callback)
          .then(() => {
            expect(mclient.on).to.have.been.called.with('message')

            mclient.emit('message', { topic: anotherTopic })
            expect(callback).not.to.have.been.called()

            mclient.emit('message', { topic: topic })
            expect(callback).to.have.been.called()
          })
      })

      it('saves the topic for later', () => {
        return messenger.listen(topic, callback)
          .then(() => {
            expect(messenger._topics).to.include(topic)
          })
      })

      it('calls connect', () => {
        return messenger.listen(topic, callback)
          .then(() => {
            expect(messenger.connect).to.have.been.called()
          })
      })

      it('calls client.subscribe with the default node and topic', () => {
        return messenger.listen(topic, callback)
          .then(() => {
            expect(mclient.subscribe).to.have.been.called.with(Messenger.DEFAULT_OPTIONS.node, topic)
          })
      })
    })

    describe('send', () => {
      const topic = 'topic'
      const data = { property1: 'value1', property2: 3 }

      beforeEach(() => {
        messenger.connect = () => Promise.resolve()
        messengerSandbox = chai.spy.sandbox()
        messengerSandbox.on(messenger, ['connect'])
      })

      it('calls connect', () => {
        return messenger.send(topic, data)
          .then(() => {
            expect(messenger.connect).to.have.been.called()
          })
      })

      it('calls getCorrelationId', () => {
        return messenger.send(topic, data)
          .then(() => {
            expect(MSCorrelationMock.getCorrelationId).to.have.been.called()
          })
      })

      it('calls publish', () => {
        return messenger.send(topic, data)
          .then(() => {
            expect(mclient.publish).to.have.been.called.with()
          })
      })
    })

    describe('connect', () => {
      const MOCK_CONNECTION_PROMISE_VALUE = 'some value'
      const MOCK_CONNECTION_PROMISE = Promise.resolve(MOCK_CONNECTION_PROMISE_VALUE)

      beforeEach(() => {
        messenger._setTimeoutToReconnect = () => Promise.resolve()
        messengerSandbox = chai.spy.sandbox()
        messengerSandbox.on(messenger, ['_setTimeoutToReconnect'])
      })

      it('does not call client.connect if the _connectionPromise is not undefined', () => {
        messenger._connectionPromise = MOCK_CONNECTION_PROMISE
        return messenger.connect()
          .then(() => {
            expect(mclient.connect).not.to.have.been.called()
          })
      })

      it('returns _connectionPromise', () => {
        messenger._connectionPromise = MOCK_CONNECTION_PROMISE
        return messenger.connect()
          .then(result => {
            expect(result).to.eq(MOCK_CONNECTION_PROMISE_VALUE)
          })
      })

      it('calls client.connect if the _connectionPromise is not undefined', () => {
        return messenger.connect()
          .then(() => {
            expect(mclient.connect).to.have.been.called()
            expect(messenger._logger.debug).to.have.been.called.exactly(2)
          })
      })

      it('logs and calls _setTimeoutToReconnect if there is an error', () => {
        mclient.connect = () => Promise.reject(new Error('ERROR'))
        return messenger.connect()
          .then(() => {
            expect(messenger._logger.debug).to.have.been.called()
            expect(messenger._setTimeoutToReconnect).to.have.been.called()
            mclient.connect = () => Promise.resolve()
          })
      })
    })

    describe('_setTimeoutToReconnect', () => {
      beforeEach(() => {
        messenger.connect = () => Promise.resolve()
        messengerSandbox = chai.spy.sandbox()
        messengerSandbox.on(messenger, ['connect'])
      })

      it('resets the connection promise', () => {
        messenger._setTimeoutToReconnect()
        expect(messenger.connectionPromise).to.eq(undefined)
      })

      it('calls _conncect after the timeout specified in options.reconnectTimeout', () => {
        messenger.options.reconnectTimeout = 0
        return messenger._setTimeoutToReconnect()
          .then(() => {
            expect(messenger.connect).to.have.been.called()
          })
      })
    })
  })

  describe('with credentials', () => {
    let messenger
    let messengerSandbox
    const username = 'username'
    const password = 'password'

    beforeEach(() => {
      messenger = new Messenger({ credentials: { username, password } })
    })

    describe('constructor', () => {
      it('creates a Mhub client', () => {
        expect(messenger._client).to.eq(mclient)
      })
    })

    describe('connect', () => {
      beforeEach(() => {
        messenger._setTimeoutToReconnect = () => Promise.resolve()
        messengerSandbox = chai.spy.sandbox()
        messengerSandbox.on(messenger, ['_setTimeoutToReconnect'])
      })

      it('calls client.login', () => {
        messenger._logger.debug = chai.spy.returns(Promise.resolve())
        return messenger.connect()
          .then(() => {
            expect(mclient.login).to.have.been.called.with(username, password)
            expect(messenger._logger.debug).to.have.been.called.exactly(3)
          })
      })
    })
  })
})
