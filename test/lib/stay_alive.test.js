const chai = require('chai')
const sinon = require('sinon')
const spies = require('chai-spies')
const Promise = require('bluebird')

chai.use(spies)

const SECOND = 1000

const PROMISE = 'PROMISE'
const RECONNECTION_TIMEOUT = 10 * SECOND
const NODE = 'NODE'
const TOPIC1 = 'TOPIC1'
const TOPIC2 = 'TOPIC2'

let connectSpy
let clientEventListenSpy
let clientSubscribeSpy

const { keepAlive } = require('../../lib/stay_alive')

const expect = chai.expect

function expectTimeoutToReconnectToBeSet (messenger, systemTimer) {
  expect(messenger._connectionPromise).to.be.undefined
  systemTimer.tick(RECONNECTION_TIMEOUT)
  expect(connectSpy).to.have.been.called()
}

describe('stay alive', () => {
  let messenger, systemTimer

  beforeEach(() => {
    messenger = {
      _connectionPromise: PROMISE,
      _listenPostactions: [],
      _connectionPostactions: [],
      _connectionErroractions: [],
      Promise,
      options: {
        reconnectTimeout: RECONNECTION_TIMEOUT,
        node: NODE
      },
      connect: function () {
        return connectSpy.apply(this, arguments)
      },
      client: {
        on: function () {
          return clientEventListenSpy.apply(this, arguments)
        },
        _handlers: {},
        subscribe: function () {
          return clientSubscribeSpy.apply(this, arguments)
        }
      }
    }
    connectSpy = chai.spy(() => Promise.resolve())
    clientSubscribeSpy = chai.spy(() => { })
    clientEventListenSpy = chai.spy((event, handler) => {
      messenger.client._handlers[event] = handler
    })

    systemTimer = sinon.useFakeTimers()
  })

  afterEach(() => {
    systemTimer.restore()
  })

  it('adds an action to the client `close` event', () => {
    keepAlive(messenger)
    expect(messenger.client._handlers.close).to.not.be.undefined
  })

  it('adds an action to the client `close` event which sets the timeout to reconnect', () => {
    keepAlive(messenger)
    messenger.client._handlers.close()
    expectTimeoutToReconnectToBeSet(messenger, systemTimer)
  })

  it('adds one action to listenPostactions', () => {
    keepAlive(messenger)
    expect(messenger._listenPostactions.length).to.equal(1)
  })

  it('adds one action to connectionPostactions', () => {
    keepAlive(messenger)
    expect(messenger._connectionPostactions.length).to.equal(1)
  })

  it('restores all old topics', () => {
    keepAlive(messenger)
    messenger._listenPostactions[0](TOPIC1)
    messenger._listenPostactions[0](TOPIC2)
    messenger._connectionPostactions[0]()
    expect(clientSubscribeSpy).to.have.been.called.with(NODE, TOPIC1)
    expect(clientSubscribeSpy).to.have.been.called.with(NODE, TOPIC2)
  })

  it('adds one action to connectionErroractions', () => {
    keepAlive(messenger)
    expect(messenger._connectionErroractions.length).to.equal(1)
  })

  it('adds an action to connectionErroractions which sets the timeout to reconnect', () => {
    keepAlive(messenger)
    messenger._connectionErroractions[0]()
    expectTimeoutToReconnectToBeSet(messenger, systemTimer)
  })
})
