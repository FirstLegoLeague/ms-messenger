const chai = require('chai')
const proxyquire = require('proxyquire')
const spies = require('chai-spies')

chai.use(spies)

let mclient
let mclientSpy
let messengerFactorySpy

window.mhubURI = process.env.MHUB_URI

const { createMessenger } = proxyquire('../browser', {
  'mhub/dist/src/browserclient': {
    MClient: function () {
      return mclientSpy.apply(this, arguments)
    }
  },
  './lib/messenger_factory': {
    createMessenger: function () {
      return messengerFactorySpy.apply(this, arguments)
    }
  }
})

const expect = chai.expect

describe('ms-messenger in client', () => {
  beforeEach(() => {
    mclient = { id: 'client' }
    messengerFactorySpy = chai.spy(() => mclient)
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

  it('calls MClient with the global mhubURI if options has no mhub URI field', () => {
    const options = { }

    createMessenger(options)
    expect(mclientSpy).to.have.been.called.with(window.mhubURI)
  })

  it('calls messenger factory', () => {
    const mhubURI = 'ws://some.uri'
    const options = { mhubURI }

    createMessenger(options)
    expect(messengerFactorySpy).to.have.been.called()
  })
})
