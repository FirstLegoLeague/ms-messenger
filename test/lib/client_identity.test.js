const chai = require('chai')
const proxyquire = require('proxyquire')
const spies = require('chai-spies')

chai.use(spies)

const RANDOM_ID = 'RANDOM_ID'
const PRESET_ID = 'PRESET_ID'

let randomaticSpy

const { identifyMesseger } = proxyquire('../../lib/client_identity', {
  randomatic: function () {
    return randomaticSpy.apply(this, arguments)
  }
})

const expect = chai.expect

describe('client identity', () => {
  let messenger

  beforeEach(() => {
    messenger = {
      options: { },
      _headersProviders: []
    }
    randomaticSpy = chai.spy(() => RANDOM_ID)
  })

  it('sets clientId field of the messenger from messenger options if it exists', () => {
    messenger.options.clientId = PRESET_ID
    identifyMesseger(messenger)
    expect(messenger.clientId).to.equal(PRESET_ID)
  })

  it('sets clientId field of the messenger from ramdonize if it doesn\'t exists in the messenger options', () => {
    identifyMesseger(messenger)
    expect(messenger.clientId).to.equal(RANDOM_ID)
  })

  it('adds one action to the headersProviders', () => {
    identifyMesseger(messenger)
    expect(messenger._headersProviders.length).to.equal(1)
  })

  it('adds an action to the headersProviders which returns a client-id headers object', () => {
    identifyMesseger(messenger)
    expect(messenger._headersProviders[0]()).to.eql({ 'client-id': messenger.clientId })
  })
})
