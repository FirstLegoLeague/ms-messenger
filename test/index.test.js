const chai = require('chai')
const proxyquire = require('proxyquire')
const spies = require('chai-spies')

chai.use(spies)

let mclient
let mclientSpy
let loggingSpy
let messengerFactorySpy
let correlateMessegerSpy

const { createMessenger } = proxyquire('../', {
  'mhub/dist/src/nodeclient': {
    MClient: function () {
      return mclientSpy.apply(this, arguments)
    }
  },
  './lib/messenger_factory': {
    createMessenger: function () {
      return messengerFactorySpy.apply(this, arguments)
    }
  },
  './lib/correlation': {
    correlateMesseger: function () {
      return correlateMessegerSpy.apply(this, arguments)
    }
  },
  './lib/logging': {
    logMessengerEvents: function () {
      return loggingSpy.apply(this, arguments)
    }
  }
})

const expect = chai.expect

describe('ms-messenger in client', () => {
  beforeEach(() => {
    mclient = { id: 'client' }
    messengerFactorySpy = chai.spy(() => mclient)
    correlateMessegerSpy = chai.spy(() => { })
    loggingSpy = chai.spy(() => { })
    mclientSpy = chai.spy(() => mclient)
  })

  it('returns a messenger built by messenger factory', () => {
    expect(createMessenger()).to.equal(mclient)
  })

  it('calls MClient with the mhub URI', () => {
    const mhubURI = 'ws://some.uri'
    const options = { mhubURI }

    createMessenger(options)
    expect(mclientSpy).to.have.been.called.with(mhubURI)
  })

  it('calls MClient with the process MHUB_URI if options has no mhub URI field', () => {
    const options = { }

    createMessenger(options)
    expect(mclientSpy).to.have.been.called.with(process.env.MHUB_URI)
  })

  it('calls messenger factory', () => {
    const mhubURI = 'ws://some.uri'
    const options = { mhubURI }

    createMessenger(options)
    expect(messengerFactorySpy).to.have.been.called()
  })

  it('enables logging', () => {
    const messenger = createMessenger(mclient, { })
    expect(loggingSpy).to.have.been.called.with(messenger)
  })

  it('calls correlateMesseger with the client', () => {
    const mhubURI = 'ws://some.uri'
    const options = { mhubURI }

    createMessenger(options)
    expect(correlateMessegerSpy).to.have.been.called.with(mclient)
  })
})
