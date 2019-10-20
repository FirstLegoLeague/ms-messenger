const chai = require('chai')
const spies = require('chai-spies')
const proxyquire = require('proxyquire')

chai.use(spies)

const presetClientId = 'some-id'
const randomClientId = 'ramdon-id'
let randomize

const { getClientId } = proxyquire('../../lib/identity', {
  randomatic: function () {
    return randomize.apply(this, arguments)
  }
})

const expect = chai.expect

describe('identity getClientId', () => {
  beforeEach(() => {
    randomize = chai.spy(() => randomClientId)
  })

  it('returns the ID from the options if it was givven', () => {
    expect(getClientId({ clientId: presetClientId })).to.equal(presetClientId)
  })

  it('returns a random ID if no ID was givven in the options', () => {
    expect(getClientId({ })).to.equal(randomClientId)
  })

  it('returns a random ID if no options were givven', () => {
    expect(getClientId()).to.equal(randomClientId)
  })
})
