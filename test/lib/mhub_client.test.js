const chai = require('chai')
const spies = require('chai-spies')
const proxyquire = require('proxyquire')

chai.use(spies)

const BROWSER_MHUB_CLIENT = 'BROWSER_MHUB_CLIENT'
const NODE_MHUB_CLIENT = 'NODE_MHUB_CLIENT'

function requireMhubClient (isServer) {
  return proxyquire('../../lib/mhub_client', {
    'detect-node': isServer,
    'mhub/dist/src/browserclient': {
      MClient: BROWSER_MHUB_CLIENT
    },
    'mhub/dist/src/nodeclient': {
      MClient: NODE_MHUB_CLIENT
    }
  })
}

const expect = chai.expect

describe('mhub client', () => {
  it('returns the browser mhub client if in client mode', () => {
    const { MhubClient } = requireMhubClient(false)
    expect(MhubClient).to.equal(BROWSER_MHUB_CLIENT)
  })

  it('returns the node mhub client if in client mode', () => {
    const { MhubClient } = requireMhubClient(true)
    expect(MhubClient).to.equal(NODE_MHUB_CLIENT)
  })
})
