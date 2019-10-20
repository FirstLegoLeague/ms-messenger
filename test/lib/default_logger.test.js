const chai = require('chai')
const spies = require('chai-spies')
const proxyquire = require('proxyquire')

chai.use(spies)

const MOCK_LOGGER = { }

function requireDefaultLogger (isServer) {
  return proxyquire('../../lib/default_logger', {
    'detect-node': isServer,
    '@first-lego-league/ms-logger': {
      Logger: function () {
        return MOCK_LOGGER
      }
    }
  })
}

const expect = chai.expect

describe('default logger', () => {
  it('returns an empty logger if in client mode', () => {
    const { getDefaultLogger } = requireDefaultLogger(false)
    const defaultLogger = getDefaultLogger()
    expect(defaultLogger.debug.constructor).to.eq(Function)
    expect(defaultLogger.info.constructor).to.eq(Function)
    expect(defaultLogger.warn.constructor).to.eq(Function)
    expect(defaultLogger.error.constructor).to.eq(Function)
    expect(defaultLogger.fatal.constructor).to.eq(Function)
  })

  it('returns an ms-logger logger if in server mode', () => {
    const { getDefaultLogger } = requireDefaultLogger(true)
    expect(getDefaultLogger()).to.equal(MOCK_LOGGER)
  })
})
