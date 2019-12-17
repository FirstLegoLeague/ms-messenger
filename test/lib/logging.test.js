const chai = require('chai')
const proxyquire = require('proxyquire')
const spies = require('chai-spies')

chai.use(spies)

let logger
let clientEventListenSpy
let loggerDebugSpy
let loggerErrorSpy

const { logMessengerEvents } = proxyquire('../../lib/logging', {
  '@first-lego-league/ms-logger': {
    Logger: function () {
      return logger
    }
  }
})

const expect = chai.expect

describe('loggin', () => {
  let messenger

  beforeEach(() => {
    messenger = {
      _connectionPreactions: [],
      _connectionPostactions: [],
      client: {
        on: function () {
          return clientEventListenSpy.apply(this, arguments)
        },
        _handlers: {}
      }
    }
    logger = {
      debug: function () {
        return loggerDebugSpy.apply(this, arguments)
      },
      error: function () {
        return loggerErrorSpy.apply(this, arguments)
      }
    }

    clientEventListenSpy = chai.spy((event, handler) => {
      messenger.client._handlers[event] = handler
    })
    loggerDebugSpy = chai.spy(() => { })
    loggerErrorSpy = chai.spy(() => { })
  })

  it('adds the givven logger as a logger field to the client', () => {
    logMessengerEvents(messenger)
    expect(messenger.logger).to.equal(logger)
  })

  it('adds one action to connectionPreactions', () => {
    logMessengerEvents(messenger)
    expect(messenger._connectionPostactions.length).to.equal(1)
  })

  it('adds an action to connectionPreactions which logs pre connection message in debug level', () => {
    logMessengerEvents(messenger)
    messenger._connectionPreactions[0]()
    expect(loggerDebugSpy).to.have.been.called.with('Connecting to MHub')
  })

  it('adds one action to connectionPostactions', () => {
    logMessengerEvents(messenger)
    expect(messenger._connectionPostactions.length).to.equal(1)
  })

  it('adds an action to connectionPostactions which logs post connection message in debug level', () => {
    logMessengerEvents(messenger)
    messenger._connectionPostactions[0]()
    expect(loggerDebugSpy).to.have.been.called.with('Connected to MHub')
  })

  it('adds an action to the client `error` event', () => {
    logMessengerEvents(messenger)
    expect(messenger.client._handlers.error).to.not.be.undefined
  })

  it('adds an action to the client `error` event which logs a message in error level for connection failure', () => {
    const error = 'error'
    logMessengerEvents(messenger, logger)
    messenger.client._handlers.error(error)
    expect(loggerErrorSpy).to.have.been.called.with(`Unable to connect to MHub: ${error}`)
  })

  it('adds an action to the client `close` event', () => {
    logMessengerEvents(messenger, logger)
    expect(messenger.client._handlers.close).to.not.be.undefined
  })

  it('adds an action to the client `close` event which logs a message in error level for disconnection', () => {
    const error = 'error'
    logMessengerEvents(messenger, logger)
    messenger.client._handlers.close(error)
    expect(loggerErrorSpy).to.have.been.called.with(`Disconnected from MHub: ${error}`)
  })
})
