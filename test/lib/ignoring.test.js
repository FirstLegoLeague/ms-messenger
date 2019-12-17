const chai = require('chai')
const spies = require('chai-spies')

chai.use(spies)

const TOPIC = 'TOPIC'
const ANOTHER_TOPIC = 'ANOTHER TOPIC'
const MESSAGE_OF_TOPIC = { TOPIC }
const MESSAGE_OF_ANOTHER_TOPIC = { TOPIC: ANOTHER_TOPIC }

const { ignoreByTopic } = require('../../lib/ignoring')

const expect = chai.expect

describe('ignoring', () => {
  let messenger

  beforeEach(() => {
    messenger = { _handlingFilters: [] }
  })

  it('adds one action to the handlingFilters', () => {
    ignoreByTopic(messenger)
    expect(messenger._handlingFilters.length).to.equal(1)
  })

  it('adds a filter to the headersProviders which returns true before calling ignoreNextMessageOfTopic', () => {
    ignoreByTopic(messenger)
    expect(messenger._handlingFilters[0](MESSAGE_OF_TOPIC, TOPIC)).to.equal(true)
  })

  it('adds a filter to the headersProviders which returns false for a message from the givven topic after calling ignoreNextMessageOfTopic', () => {
    ignoreByTopic(messenger)
    messenger.ignoreNextMessageOfTopic(TOPIC)
    expect(messenger._handlingFilters[0](MESSAGE_OF_TOPIC, TOPIC)).to.equal(false)
  })

  it('adds a filter to the headersProviders which returns true for a message from another topic after calling ignoreNextMessageOfTopic', () => {
    ignoreByTopic(messenger)
    messenger.ignoreNextMessageOfTopic(TOPIC)
    expect(messenger._handlingFilters[0](MESSAGE_OF_ANOTHER_TOPIC, ANOTHER_TOPIC)).to.equal(true)
  })
})
