const chai = require('chai')
const proxyquire = require('proxyquire')
const spies = require('chai-spies')

chai.use(spies)

const CORRELATION_ID = 'CORRELATION_ID'

let correlationSpy

const { correlateMesseger } = proxyquire('../../lib/correlation', {
  '@first-lego-league/ms-correlation': {
    getCorrelationId: function () {
      return correlationSpy.apply(this, arguments)
    }
  }
})

const expect = chai.expect

describe('correlation', () => {
  let messenger

  beforeEach(() => {
    messenger = {
      _headersProviders: []
    }
    correlationSpy = chai.spy(() => CORRELATION_ID)
  })

  it('adds one action to the headersProviders', () => {
    correlateMesseger(messenger)
    expect(messenger._headersProviders.length).to.equal(1)
  })

  it('adds an action to the headersProviders which returns a correlation-id headers object', () => {
    correlateMesseger(messenger)
    expect(messenger._headersProviders[0]()).to.eql({ 'correlation-id': CORRELATION_ID })
  })

  it('adds an action to the headersProviders which calls correlateMesseger', () => {
    correlateMesseger(messenger)
    messenger._headersProviders[0]()
    expect(correlationSpy).to.have.been.called()
  })
})
