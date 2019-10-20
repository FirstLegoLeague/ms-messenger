const chai = require('chai')

const TOPIC_TO_IGNORE = 'topic1'
const TOPIC_NOT_TO_IGNORE = 'topic2'

const { ignoreNextMessageOfTopic, shouldIgnoreMessage } = require('../../lib/ignoring')

const expect = chai.expect

describe('ignoring', () => {
  it('tells to ignore if the topic was requested for ignore', () => {
    ignoreNextMessageOfTopic(TOPIC_TO_IGNORE)
    expect(shouldIgnoreMessage({ topic: TOPIC_TO_IGNORE })).to.equal(true)
  })

  it('tells not to ignore if the topic was not the one requested for ignore', () => {
    ignoreNextMessageOfTopic(TOPIC_TO_IGNORE)
    expect(shouldIgnoreMessage({ topic: TOPIC_NOT_TO_IGNORE })).to.equal(false)
  })

  it('tells not to ignore on the second time called if the topic was requested for ignore', () => {
    ignoreNextMessageOfTopic(TOPIC_TO_IGNORE)
    shouldIgnoreMessage({ topic: TOPIC_TO_IGNORE })
    expect(shouldIgnoreMessage({ topic: TOPIC_TO_IGNORE })).to.equal(true)
  })
})
