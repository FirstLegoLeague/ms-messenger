const chai = require('chai')
const spies = require('chai-spies')
const proxyquire = require('proxyquire')

chai.use(spies)

const CLIENT_ID_KEY = 'client-id'
const CORRELATION_ID_KEY = 'correlation-id'

const CLIENT_ID = 'CLIENT_ID'
const CORRELATION_ID = 'CORRELATION_ID'
const CLIENT = { clientId: CLIENT_ID }

let correlationIdSpy

function requireHeaders (isServer) {
  return proxyquire('../../lib/headers', {
    'detect-node': isServer,
    '@first-lego-league/ms-correlation': {
      getCorrelationId: () => {
        return correlationIdSpy.apply(this, arguments)
      }
    }
  })
}

const expect = chai.expect

describe('headers', () => {
  beforeEach(() => {
    correlationIdSpy = chai.spy(() => CORRELATION_ID)
  })

  it('adds client-id header if in server mode', () => {
    const { headers } = requireHeaders(true)
    expect(headers(CLIENT)[CLIENT_ID_KEY]).to.equal(CLIENT_ID)
  })

  it('adds correlation-id header if in server mode', () => {
    const { headers } = requireHeaders(true)
    expect(headers(CLIENT)[CORRELATION_ID_KEY]).to.equal(CORRELATION_ID)
  })

  it('adds client-id header if in client mode', () => {
    const { headers } = requireHeaders(false)
    expect(headers(CLIENT)[CLIENT_ID_KEY]).to.equal(CLIENT_ID)
  })

  it('does not add correlation-id header if in client mode', () => {
    const { headers } = requireHeaders(false)
    expect(headers(CLIENT).hasOwnProperty(CORRELATION_ID_KEY)).to.equal(false)
  })
})
