'use strict'

const chai = require('chai')
const spies = require('chai-spies')

chai.use(spies)

const correlationId = '123456'

const getCorrelationId = chai.spy.returns(correlationId)

exports.MSCorrelationMock = { getCorrelationId }
