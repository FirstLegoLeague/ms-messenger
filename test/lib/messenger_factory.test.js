const chai = require('chai')
const proxyquire = require('proxyquire')
const spies = require('chai-spies')

chai.use(spies)

const CLIENT = { }

let mclient
let messengerSpy
let identitySpy
let ignoringSpy
let stayAliveSpy
let authenticationSpy

const { createMessenger } = proxyquire('../../lib/messenger_factory', {
  './messenger': {
    Messenger: function () {
      return messengerSpy.apply(this, arguments)
    }
  },
  './client_identity': {
    identifyMesseger: function () {
      return identitySpy.apply(this, arguments)
    }
  },
  './ignoring': {
    ignoreByTopic: function () {
      return ignoringSpy.apply(this, arguments)
    }
  },
  './stay_alive': {
    keepAlive: function () {
      return stayAliveSpy.apply(this, arguments)
    }
  },
  './authentication': {
    authenticateMesseger: function () {
      return authenticationSpy.apply(this, arguments)
    }
  }
})

const expect = chai.expect

describe('ms-messenger in client', () => {
  beforeEach(() => {
    mclient = { id: 'client' }
    messengerSpy = chai.spy(() => mclient)
    identitySpy = chai.spy(() => { })
    ignoringSpy = chai.spy(() => { })
    stayAliveSpy = chai.spy(() => { })
    authenticationSpy = chai.spy(() => { })
  })

  it('returns a messenger built out of a Messenger class', () => {
    expect(createMessenger(CLIENT, { })).to.equal(mclient)
  })

  it('calls Messenger with the client and the options', () => {
    const options = { }
    createMessenger(CLIENT, options)
    expect(messengerSpy).to.have.been.called.with(CLIENT, options)
  })

  it('enables client identity', () => {
    const messenger = createMessenger(CLIENT, { })
    expect(identitySpy).to.have.been.called.with(messenger)
  })

  it('enables ignoring by topic', () => {
    const messenger = createMessenger(CLIENT, { })
    expect(ignoringSpy).to.have.been.called.with(messenger)
  })

  it('enables stay-alive', () => {
    const messenger = createMessenger(CLIENT, { })
    expect(stayAliveSpy).to.have.been.called.with(messenger)
  })

  it('enables authentication if options has credentials', () => {
    const messenger = createMessenger(CLIENT, { credentials: { } })
    expect(authenticationSpy).to.have.been.called.with(messenger)
  })

  it('does not enable authentication if options does not have credentials', () => {
    createMessenger(CLIENT, { })
    expect(authenticationSpy).to.not.have.been.called()
  })
})
